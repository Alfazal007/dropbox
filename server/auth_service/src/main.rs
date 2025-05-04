use std::env;

use actix_web::{App, HttpServer, middleware::Logger, web};
use controllers::signup::sign_up_controller;
use env_logger::Env;
use sqlx::{Pool, Postgres, postgres::PgPoolOptions};

pub mod controllers;
pub mod errors;
pub mod helpers;
pub mod models;

pub struct AppState {
    pub db_pool: Pool<Postgres>,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenvy::dotenv().expect("env variables not found");
    let database_url = env::var("DATABASE_URL").expect("Database  url not found");
    env_logger::init_from_env(Env::new().default_filter_or("info"));
    let pool = PgPoolOptions::new()
        .max_connections(2)
        .connect(&database_url)
        .await
        .expect("Issue connecting to the database");

    HttpServer::new(move || {
        App::new()
            .wrap(Logger::default())
            .app_data(web::Data::new(AppState {
                db_pool: pool.clone(),
            }))
            .service(
                web::scope("/api/v1/user").route("/signup", web::post().to(sign_up_controller)),
            )
    })
    .bind(("127.0.0.1", 8000))?
    .run()
    .await
}
