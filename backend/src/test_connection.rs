use sea_orm::{Database, DatabaseConnection, DbErr};

pub async fn test_database_connection() -> Result<DatabaseConnection, DbErr> {
    let database_url = std::env::var("SUPABASE_SESSION_POOLER_URL").expect("SUPABASE_SESSION_POOLER_URL must be set");

    match Database::connect(&database_url).await {
        Ok(db) => {
            println!("✅ 数据库连接成功！");
            // 执行一个简单的查询来进一步验证连接
            match db.ping().await {
                Ok(_) => {
                    println!("✅ 数据库响应正常！");
                    Ok(db)
                }
                Err(e) => {
                    println!("❌ 数据库无响应: {}", e);
                    Err(e)
                }
            }
        }
        Err(e) => {
            println!("❌ 数据库连接失败: {}", e);
            Err(e)
        }
    }
}

#[tokio::main]
async fn main() {
    // 尝试从 .env.local 文件加载环境变量
    dotenv::from_filename(".env.local").ok();

    match test_database_connection().await {
        Ok(_) => {
            println!("🎉 数据库连接测试完成！");
            std::process::exit(0);
        }
        Err(e) => {
            println!("💥 连接测试失败: {}", e);
            std::process::exit(1);
        }
    }
}
