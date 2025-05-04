use actix_web::{HttpResponse, Responder, web};
use bcrypt::hash;
use validator::Validate;

use crate::{
    AppState,
    errors::{
        general_error::GeneralErrorsToBeReturned, validation_errors::ValidationErrorsToBeReturned,
    },
    models::user::{UserDatabase, UserReqBody},
};

pub async fn sign_up_controller(
    app_state: web::Data<AppState>,
    sign_up_user: web::Json<UserReqBody>,
) -> impl Responder {
    if let Err(e) = sign_up_user.validate() {
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
            .bind(&sign_up_user.0.username)
            .fetch_optional(&app_state.db_pool)
            .await;

    match user_from_db_result {
        Err(e) => {
            return HttpResponse::InternalServerError().json(GeneralErrorsToBeReturned {
                errors: e.to_string(),
            });
        }
        Ok(user_data) => {
            if let Some(_) = user_data {
                return HttpResponse::InternalServerError().json(GeneralErrorsToBeReturned {
                    errors: "Choose a different username as this one is taken already".to_string(),
                });
            }
        }
    }
    let hashed_password_result = hash(&sign_up_user.0.password, 12);
    if hashed_password_result.is_err() {
        return HttpResponse::InternalServerError().json(GeneralErrorsToBeReturned {
            errors: "Issue hashing the password".to_string(),
        });
    }

    let user_creation_result = sqlx::query_as::<_, UserDatabase>(
        "insert into users(username, password)
values ($1, $2) returning *
",
    )
    .bind(sign_up_user.0.username)
    .bind(hashed_password_result.unwrap())
    .fetch_optional(&app_state.db_pool)
    .await;

    match user_creation_result {
        Err(e) => {
            return HttpResponse::InternalServerError().json(GeneralErrorsToBeReturned {
                errors: e.to_string(),
            });
        }
        Ok(user_data) => {
            if let None = user_data {
                return HttpResponse::InternalServerError().json(GeneralErrorsToBeReturned {
                    errors: "Issue creating new user".to_string(),
                });
            }
        }
    }

    HttpResponse::Created().json("User created successfully")
}
