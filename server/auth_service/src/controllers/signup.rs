use actix_web::{HttpResponse, Responder, web};
use validator::Validate;

use crate::{errors::validation_errors::ValidationErrorsToBeReturned, models::user::UserReqBody};

pub async fn sign_up_controller(sign_up_user: web::Json<UserReqBody>) -> impl Responder {
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
    HttpResponse::Ok().body("sign up route")
}
