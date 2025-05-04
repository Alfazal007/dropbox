use sqlx::prelude::FromRow;
use validator::Validate;

#[derive(serde::Deserialize, Validate, Debug)]
pub struct UserReqBody {
    #[validate(length(
        min = 6,
        max = 20,
        message = "Username should be between 6 and 20 length"
    ))]
    pub username: String,
    #[validate(length(
        min = 6,
        max = 20,
        message = "Password should be between 6 and 20 length"
    ))]
    pub password: String,
}

#[derive(serde::Deserialize, Debug, FromRow)]
pub struct UserDatabase {
    pub id: i32,
    pub username: String,
    pub password: String,
    pub machine_count: i32,
}
