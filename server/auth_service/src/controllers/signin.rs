use actix_web::{HttpResponse, Responder, web};
use bcrypt::verify;
use redis::{Commands, RedisResult};
use uuid::Uuid;
use validator::Validate;

use crate::{
    AppState,
    errors::{
        general_error::GeneralErrorsToBeReturned, validation_errors::ValidationErrorsToBeReturned,
    },
    models::user::{UserDatabase, UserReqBody},
};

#[derive(serde::Serialize)]
struct Token {
    id: String,
    machine_count: i32,
}

pub async fn sign_in_controller(
    app_state: web::Data<AppState>,
    sign_in_user: web::Json<UserReqBody>,
) -> impl Responder {
    if let Err(e) = sign_in_user.validate() {
        let mut validation_errors: Vec<String> = Vec::new();
        for (_, err) in e.field_errors().iter() {
            if let Some(message) = &err[0].message {
                validation_errors.push(message.clone().into_owned());
            }
        }
        return HttpResponse::BadRequest().json(ValidationErrorsToBeReturned {
            errors: validation_errors,
        });
    }

    let user_from_db_result =
        sqlx::query_as::<_, UserDatabase>("select * from users where username=$1 limit 1")
            .bind(&sign_in_user.0.username)
            .fetch_optional(&app_state.db_pool)
            .await;

    match &user_from_db_result {
        Err(e) => {
            return HttpResponse::InternalServerError().json(GeneralErrorsToBeReturned {
                errors: e.to_string(),
            });
        }
        Ok(user_data) => {
            if let None = user_data {
                return HttpResponse::NotFound().json(GeneralErrorsToBeReturned {
                    errors: "Issue finding the user in the database".to_string(),
                });
            }
        }
    }
    let user_from_db = user_from_db_result.as_ref().unwrap().as_ref().unwrap();

    let password_verify_result = verify(&sign_in_user.0.password, &user_from_db.password);
    if password_verify_result.is_err() {
        return HttpResponse::InternalServerError().json(GeneralErrorsToBeReturned {
            errors: "Issue validating the password".to_string(),
        });
    }
    if !password_verify_result.unwrap() {
        return HttpResponse::InternalServerError().json(GeneralErrorsToBeReturned {
            errors: "Wrong password".to_string(),
        });
    }

    let user_from_db_result = sqlx::query_as::<_, UserDatabase>(
        "
    update users set machine_count=$1 where id=$2 returning *
",
    )
    .bind(user_from_db.machine_count + 1)
    .bind(&user_from_db.id)
    .fetch_optional(&app_state.db_pool)
    .await;

    match &user_from_db_result {
        Err(e) => {
            return HttpResponse::InternalServerError().json(GeneralErrorsToBeReturned {
                errors: e.to_string(),
            });
        }
        Ok(user_data) => {
            if let None = user_data {
                return HttpResponse::NotFound().json(GeneralErrorsToBeReturned {
                    errors: "Issue finding the user in the database".to_string(),
                });
            }
        }
    }

    let id = Uuid::new_v4().to_string();
    let key_redis = format!(
        "{}{}",
        user_from_db_result
            .as_ref()
            .unwrap()
            .as_ref()
            .unwrap()
            .machine_count,
        user_from_db_result
            .as_ref()
            .unwrap()
            .as_ref()
            .unwrap()
            .username,
    );

    let mut redis_connection = app_state.redis_conn.get().unwrap();
    let redis_result: RedisResult<()> = redis_connection.set(key_redis, &id);
    if redis_result.is_err() {
        return HttpResponse::InternalServerError().json(GeneralErrorsToBeReturned {
            errors: "Issue talking to redis".to_string(),
        });
    }
    HttpResponse::Ok().json(Token {
        id,
        machine_count: user_from_db_result.unwrap().unwrap().machine_count,
    })
}
