# API Versioning Strategy

This document outlines the versioning strategy for the Mercenary API to ensure backward compatibility and smooth transitions between versions.

## Versioning Scheme

We follow [Semantic Versioning (SemVer)](https://semver.org/) for our API versions with the format `MAJOR.MINOR.PATCH`:

- **MAJOR**: Breaking changes that require updates from clients
- **MINOR**: New features that are backward-compatible
- **PATCH**: Backward-compatible bug fixes

## Versioning in URLs

API versions are included in the URL path:

```
https://api.mercenary.example.com/api/v1/endpoint
```

- The `v` prefix is followed by the major version number (e.g., `v1`, `v2`)
- Minor and patch versions are not included in the URL but are tracked in the API documentation

## Versioning Headers

In addition to URL versioning, clients can specify the API version using the `Accept` header:

```
Accept: application/vnd.mercenary.v1+json
```

## Deprecation Policy

1. **Announcement**: Deprecated endpoints will be announced at least 3 months before removal
2. **Documentation**: Deprecated endpoints will be clearly marked in the API documentation
3. **Response Headers**: Deprecated endpoints will include a `Deprecation` header
4. **Sunset Period**: Minimum 6 months between deprecation and removal

## Breaking Changes

The following are considered breaking changes that require a major version bump:

- Removing or renaming API endpoints
- Removing or renaming request/response fields
- Changing the data type of existing fields
- Changing authentication or authorization requirements
- Changing error response formats

## Non-Breaking Changes

The following changes are considered non-breaking and only require a minor or patch version bump:

- Adding new API endpoints
- Adding new optional request parameters
- Adding new fields to responses
- Adding new error codes
- Performance improvements that don't change behavior

## Version Lifecycle

1. **Alpha**: Initial development, breaking changes may occur without notice
2. **Beta**: Feature complete, API is stable but may have bugs
3. **Stable**: Production-ready, follows deprecation policy
4. **Deprecated**: Scheduled for removal, avoid using
5. **Retired**: No longer available

## Version Support

- We support the current stable version and one previous major version
- Critical security updates may be backported to previous versions
- End-of-life (EOL) versions will be announced at least 6 months in advance

## Migration Guides

When a new major version is released, we will provide a migration guide that includes:

- List of breaking changes
- Step-by-step migration instructions
- Code examples for common use cases
- Tools or scripts to assist with migration

## Version Negotiation

Clients can specify their preferred API version using one of these methods (in order of precedence):

1. URL path (e.g., `/api/v1/endpoint`)
2. `Accept` header (e.g., `application/vnd.mercenary.v1+json`)
3. Query parameter (e.g., `?version=1`)

If no version is specified, the latest stable version will be used.

## Example Versioning Scenarios

### Adding a New Field

**Before (v1.0.0):**
```json
{
  "id": 1,
  "name": "Project 1"
}
```

**After (v1.1.0):**
```json
{
  "id": 1,
  "name": "Project 1",
  "description": "New description field"
}
```

### Renaming a Field (Breaking Change)

**Before (v1.0.0):**
```json
{
  "id": 1,
  "name": "Project 1"
}
```

**After (v2.0.0):**
```json
{
  "id": 1,
  "project_name": "Project 1"
}
```

## Best Practices for API Consumers

1. Always specify the API version in requests
2. Handle API version negotiation in a central location
3. Test against new versions in a staging environment before upgrading
4. Monitor deprecation headers and plan for updates
5. Use feature flags to gradually roll out API version updates

## Monitoring and Analytics

We track API version usage to:
- Identify when older versions can be deprecated
- Understand adoption rates of new versions
- Monitor for potential breaking changes in client applications

## Feedback and Support

For questions or feedback about our versioning strategy, please contact us at [api-support@mercenary.example.com](mailto:api-support@mercenary.example.com).
