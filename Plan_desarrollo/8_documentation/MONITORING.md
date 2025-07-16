# Monitoring and Alerting Guide

This document provides an overview of the monitoring and alerting infrastructure for the Mercenary backend application.

## Table of Contents

- [Overview](#overview)
- [Metrics Collection](#metrics-collection)
- [Logging](#logging)
- [Tracing](#tracing)
- [Alerting](#alerting)
- [Dashboard Examples](#dashboard-examples)
- [Incident Response](#incident-response)
- [Performance Tuning](#performance-tuning)
- [Security Monitoring](#security-monitoring)
- [Compliance](#compliance)

## Overview

Our monitoring stack consists of the following components:

- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and dashboards
- **Loki**: Log aggregation
- **Tempo**: Distributed tracing
- **Alertmanager**: Alert routing and deduplication
- **Sentry**: Error tracking and performance monitoring

## Metrics Collection

### Application Metrics

We use Prometheus to collect metrics from:

- FastAPI application (via `prometheus-fastapi-instrumentator`)
- PostgreSQL database
- Redis cache
- System resources (CPU, memory, disk, network)
- Custom business metrics

### Key Metrics to Monitor

#### Application

- Request rate
- Error rate (4xx, 5xx)
- Request latency (p50, p90, p99)
- Active users/sessions
- API endpoint performance

#### Database

- Query performance
- Connection pool usage
- Replication lag
- Deadlocks
- Cache hit ratio

#### System

- CPU usage
- Memory usage
- Disk I/O
- Network traffic
- File descriptors

### Custom Metrics

We track several custom business metrics:

- User signups
- Project creation rate
- Proposal submission rate
- Payment processing
- Feature usage

## Logging

### Log Collection

- Application logs are sent to Loki
- Structured logging with JSON format
- Log levels: DEBUG, INFO, WARNING, ERROR, CRITICAL
- Correlation IDs for request tracing

### Log Retention

- 7 days of logs retained by default
- 30 days for production environments
- 1 year for audit logs

## Tracing

### Distributed Tracing

We use OpenTelemetry for distributed tracing with the following components:

- **Tempo**: Backend for storing traces
- **OpenTelemetry Collector**: Collects and exports traces
- **Auto-instrumentation**: For FastAPI, SQLAlchemy, and HTTP clients

### Trace Sampling

- 100% of errors
- 10% of successful requests
- 100% of requests with `trace=true` header

## Alerting

### Alert Levels

- **PAGE**: Immediate attention required (wakes someone up)
- **TICKET**: Action required but not immediately critical
- **INFO**: For information only

### Alert Rules

Alert rules are defined in `monitoring/alert.rules` and include:

- High error rates (> 5% for 5 minutes)
- High latency (p99 > 1s for 5 minutes)
- Service down (health check fails for 2 minutes)
- Database connection pool exhaustion
- High system resource usage

### Notification Channels

- **P1/P2 Alerts**: PagerDuty → Phone/SMS
- **P3 Alerts**: Email to team
- **P4 Alerts**: Slack notification

## Dashboard Examples

### Application Overview

- Request rate
- Error rate
- Latency percentiles
- Active users
- Top endpoints by traffic

### Database Dashboard

- Query performance
- Connection pool usage
- Cache hit ratio
- Replication lag
- Long-running queries

### System Dashboard

- CPU/Memory/Disk usage
- Network I/O
- Process metrics
- Garbage collection
- Thread pool usage

## Incident Response

### Runbook

We maintain runbooks for common incidents in `docs/runbooks/`:

- High error rate
- Database connection issues
- Cache failures
- Performance degradation
- Security incidents

### Post-Mortem Process

1. Document the incident timeline
2. Identify root cause
3. Implement fixes
4. Update monitoring/alerting
5. Share learnings with the team

## Performance Tuning

### Bottleneck Identification

1. Check application metrics for high latency endpoints
2. Analyze database query performance
3. Review system resource usage
4. Identify slow dependencies

### Optimization Strategies

- Query optimization
- Caching strategies
- Connection pooling
- Asynchronous processing
- Horizontal scaling

## Security Monitoring

### Security Events

- Failed login attempts
- Suspicious API usage
- Unauthorized access attempts
- Data access patterns

### Vulnerability Scanning

- Regular dependency scans
- Container image scanning
- Infrastructure as Code (IaC) scanning
- Static code analysis

## Compliance

### Audit Logging

- User authentication events
- Sensitive data access
- Configuration changes
- Permission modifications

### Retention Policies

- 90 days for application logs
- 1 year for audit logs
- 30 days for metrics
- 7 days for high-cardinality data

## Getting Help

For questions about monitoring or to report issues:

- **Slack**: #monitoring-alerts
- **Email**: monitoring@mercenary.example.com
- **On-call**: Check PagerDuty schedule

## Additional Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Sentry Documentation](https://docs.sentry.io/)
