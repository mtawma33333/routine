# Backend Service

## Run (Dev)
```
cargo run
```

## Project Structure
```
src/
  main.rs
  config.rs         # config load (env + default)
  errors.rs         # error-handler -> GraphQL Error
  db.rs             # SeaORM Database Connection
entity/           # SeaORM Entity
migration/        # SeaORM Migration
graphql/
  schema.rs       # RootSchema
  types/          # Object/Enum/Scalar
  resolvers/      # Query/Mutation/Subscription
domain/
service/
middleware/       # Log/Tracing/Auth
```

## API
GET /health → ok
