use std::env;

use actix_web::{App, HttpServer, middleware::Logger, web};
use controllers::{signin::sign_in_controller, signup::sign_up_controller};
use env_logger::Env;
use sqlx::{Pool, Postgres, postgres::PgPoolOptions};

pub mod controllers;
pub mod errors;
pub mod helpers;
pub mod models;

pub struct AppState {
    pub db_pool: Pool<Postgres>,
    pub redis_conn: r2d2::Pool<redis::Client>,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenvy::dotenv().expect("env variables not found");
    let database_url = env::var("DATABASE_URL").expect("Database url not found");
    let redis_url = env::var("REDIS_URL").expect("Redis url not found");
    env_logger::init_from_env(Env::new().default_filter_or("info"));
    let pool = PgPoolOptions::new()
        .max_connections(2)
        .connect(&database_url)
        .await
        .expect("Issue connecting to the database");
    let redis_client = redis::Client::open(redis_url).expect("Issue creating redis client");
    let redis_conn = r2d2::Pool::builder()
        .max_size(5)
        .build(redis_client)
        .expect("Issue connecting to redis");

    HttpServer::new(move || {
        App::new()
            .wrap(Logger::default())
            .app_data(web::Data::new(AppState {
                db_pool: pool.clone(),
                redis_conn: redis_conn.clone(),
            }))
            .service(
                web::scope("/api/v1/user")
                    .route("/signup", web::post().to(sign_up_controller))
                    .route("/signin", web::post().to(sign_in_controller)),
            )
    })
    .bind(("127.0.0.1", 8000))?
    .run()
    .await
}
