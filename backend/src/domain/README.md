# Domain Layer

领域实体、值对象、领域服务（纯 TS，无框架依赖）。

- Entities: Task, Project, Tag, Dependency, RecurrenceRule, FocusSession
- Services: Priority calc, Contextual filtering, Today classification

约束：互斥标签、层级限制、依赖无环。
