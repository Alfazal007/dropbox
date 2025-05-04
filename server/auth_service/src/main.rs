use actix_web::{App, HttpServer, middleware::Logger, web};
use controllers::signup::sign_up_controller;
use env_logger::Env;

pub mod controllers;
pub mod errors;
pub mod models;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(Env::new().default_filter_or("info"));
    HttpServer::new(|| {
        App::new()
            .wrap(Logger::default())
            .route("/sign-up", web::post().to(sign_up_controller))
    })
    .bind(("127.0.0.1", 8000))?
    .run()
    .await
}
