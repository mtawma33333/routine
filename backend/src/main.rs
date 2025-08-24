use async_graphql::{http::GraphiQLSource, *};
use async_graphql_axum::GraphQL;
use axum::{
    Router,
    response::{Html, IntoResponse},
    routing::get,
};

// 定义查询对象
struct Query;


// 实现查询对象的方法
#[Object]
impl Query {
    async fn hello(&self) -> String {
        "Hello, world!".to_string()
    }

    async fn add(&self, a: i32, b: i32) -> i32 {
        a + b
    }
}

async fn graphql() -> impl IntoResponse {
    Html(GraphiQLSource::build().endpoint("/graphql").finish())
}

async fn ok() -> &'static str {
    "ok"
}

#[tokio::main]
async fn main() {
    // 构建GraphQL Schema
    let schema = Schema::build(Query, EmptyMutation, EmptySubscription)
        // .extension(ApolloTracing)
        .finish();

    let app = Router::new()
        .route("/health", get(ok))
        .route("/graphql", get(graphql).post_service(GraphQL::new(schema)));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
