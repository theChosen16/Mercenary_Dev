# Performance Optimization Guide

This document outlines performance optimization strategies, benchmarks, and best practices for the Mercenary backend application.

## Table of Contents

- [Performance Metrics](#performance-metrics)
- [Caching Strategy](#caching-strategy)
- [Database Optimization](#database-optimization)
- [API Performance](#api-performance)
- [Background Tasks](#background-tasks)
- [Load Testing](#load-testing)
- [Benchmarks](#benchmarks)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Performance Metrics

### Key Performance Indicators (KPIs)

| Metric | Target | Description |
|--------|--------|-------------|
| API Response Time (p95) | < 500ms | 95th percentile response time |
| API Error Rate | < 0.1% | Percentage of failed requests |
| Database Query Time | < 100ms | 95th percentile query execution time |
| Cache Hit Ratio | > 90% | Percentage of cache hits |
| Concurrent Users | 10,000+ | Maximum concurrent users supported |
| Requests per Second | 1,000+ | Maximum sustained RPS |

### Monitoring Tools

- Prometheus for metrics collection
- Grafana for visualization
- Jaeger for distributed tracing
- Locust for load testing

## Caching Strategy

### Cache Layers

1. **Application-Level Caching**
   - In-memory cache for frequently accessed data
   - Redis for distributed caching

2. **Database Caching**
   - Query result caching
   - Materialized views for complex queries

3. **CDN Caching**
   - Static assets
   - API responses where appropriate

### Cache Invalidation

- Time-based expiration
- Event-based invalidation
- Cache stampede prevention

### Cache Configuration

```python
# Example Redis cache configuration
CACHE_CONFIG = {
    "default": {
        "CACHE_TYPE": "RedisCache",
        "CACHE_REDIS_URL": "redis://localhost:6379/0",
        "CACHE_DEFAULT_TIMEOUT": 300,  # 5 minutes
    },
    "session": {
        "CACHE_TYPE": "RedisCache",
        "CACHE_REDIS_URL": "redis://localhost:6379/1",
        "CACHE_DEFAULT_TIMEOUT": 86400,  # 24 hours
    },
}
```

## Database Optimization

### Indexing Strategy

- **Single-Column Indexes**
  ```sql
  CREATE INDEX idx_users_email ON users(email);
  ```

- **Composite Indexes**
  ```sql
  CREATE INDEX idx_projects_status_created ON projects(status, created_at);
  ```

- **Partial Indexes**
  ```sql
  CREATE INDEX idx_active_users ON users(email) WHERE is_active = true;
  ```

### Query Optimization

- Use `EXPLAIN ANALYZE` to analyze query plans
- Avoid `SELECT *` - only fetch needed columns
- Use pagination for large result sets
- Batch operations when possible
- Use appropriate JOINs

### Connection Pooling

```python
# SQLAlchemy connection pool configuration
SQLALCHEMY_DATABASE_URI = "postgresql://user:password@localhost/dbname"
SQLALCHEMY_ENGINE_OPTIONS = {
    "pool_size": 20,
    "max_overflow": 10,
    "pool_timeout": 30,
    "pool_recycle": 1800,  # Recycle connections after 30 minutes
}
```

## API Performance

### Response Compression

- Enable gzip compression for all responses
- Minimum size for compression: 1KB

### Pagination

- Default page size: 20 items
- Maximum page size: 100 items
- Use cursor-based pagination for large datasets

### Field Selection

Allow clients to request only needed fields:

```
GET /api/v1/users?fields=id,name,email
```

### Rate Limiting

- 1000 requests per hour per IP address
- 10000 requests per hour for authenticated users
- 100 requests per minute for sensitive endpoints

## Background Tasks

### Task Queue

- Use Celery with Redis as the message broker
- Separate queues for different priorities
- Retry failed tasks with exponential backoff

### Task Priorities

| Priority | Use Case | Time to Process |
|----------|----------|-----------------|
| High | Time-sensitive operations | < 1 minute |
| Default | Standard background tasks | < 10 minutes |
| Low | Non-critical tasks | < 1 hour |

### Async Processing

- Use async/await for I/O-bound operations
- Process CPU-bound tasks in separate processes
- Use connection pooling for database connections

## Load Testing

### Test Environment

- Same specifications as production
- Isolated from production traffic
- Realistic test data

### Test Scenarios

1. **Baseline Test**
   - 100 concurrent users
   - Ramp-up time: 1 minute
   - Duration: 5 minutes

2. **Stress Test**
   - 1000 concurrent users
   - Ramp-up time: 5 minutes
   - Duration: 15 minutes

3. **Soak Test**
   - 500 concurrent users
   - Duration: 24 hours

### Test Tools

- Locust for HTTP load testing
- k6 for protocol-level testing
- JMeter for complex scenarios

## Benchmarks

### API Endpoint Performance

| Endpoint | Requests/sec | Latency (p95) | Error Rate |
|----------|--------------|----------------|------------|
| GET /api/v1/users | 1,200 | 45ms | 0.01% |
| POST /api/v1/projects | 850 | 120ms | 0.05% |
| GET /api/v1/projects/{id} | 950 | 80ms | 0.02% |

### Database Performance

| Operation | Throughput | Latency (p95) |
|-----------|------------|----------------|
| SELECT (simple) | 15,000 ops/sec | 5ms |
| SELECT (complex) | 2,500 ops/sec | 25ms |
| INSERT | 8,000 ops/sec | 8ms |
| UPDATE | 6,000 ops/sec | 12ms |

## Monitoring

### Key Metrics to Monitor

- Request rate and latency
- Error rates (4xx, 5xx)
- Database query performance
- Cache hit/miss ratios
- Background task queue length
- System resource usage

### Alerting Thresholds

| Metric | Warning | Critical |
|--------|---------|-----------|
| API Latency (p95) | > 500ms | > 1s |
| Error Rate | > 1% | > 5% |
| Database Connections | > 80% | > 90% |
| CPU Usage | > 70% | > 90% |
| Memory Usage | > 80% | > 95% |

## Troubleshooting

### Common Issues

1. **High Database Load**
   - Check for missing indexes
   - Look for slow queries
   - Verify connection pool settings

2. **Memory Leaks**
   - Monitor memory usage over time
   - Check for unclosed resources
   - Analyze heap dumps

3. **Slow API Responses**
   - Check database queries
   - Look for external API calls
   - Check for blocking operations

### Performance Profiling

- Use `cProfile` for Python code profiling
- Use `py-spy` for live profiling
- Use `pg_stat_statements` for PostgreSQL query analysis

## Best Practices

### Code Level

- Use connection pooling
- Implement proper error handling
- Use async/await for I/O-bound operations
- Cache aggressively but wisely

### Database Level

- Use appropriate indexes
- Normalize data where appropriate
- Consider denormalization for read-heavy workloads
- Use database-specific optimizations

### Infrastructure Level

- Use CDN for static assets
- Implement horizontal scaling
- Use read replicas for read-heavy workloads
- Consider database sharding for very large datasets

## Performance Checklist

### Before Deployment
- [ ] Run load tests
- [ ] Check database query performance
- [ ] Verify cache configuration
- [ ] Set up monitoring and alerting

### After Deployment
- [ ] Monitor key metrics
- [ ] Check for regressions
- [ ] Review error rates
- [ ] Verify background task processing

## Tools and Resources

- **Profiling**: cProfile, py-spy, pyflame
- **Monitoring**: Prometheus, Grafana, Jaeger
- **Load Testing**: Locust, k6, JMeter
- **Database**: pg_stat_statements, EXPLAIN ANALYZE

## Getting Help

For performance-related issues or questions:

- **Slack**: #performance
- **Email**: performance@mercenary.example.com
- **On-call**: Check PagerDuty schedule
