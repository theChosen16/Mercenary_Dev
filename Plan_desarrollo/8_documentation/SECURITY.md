# Security Policy

> **Note**: This is a summary of our security policies and procedures. For detailed information, please refer to the [SECURITY_GUIDE.md](SECURITY_GUIDE.md) document.

## Overview

This document provides a high-level overview of the security policies for the Mercenary project. It includes information about supported versions, how to report vulnerabilities, and our security process.

## Supported Versions

We release patches for security vulnerabilities. The following versions are currently supported and eligible for security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting Security Issues

**Important**: Please do not report security vulnerabilities through public GitHub issues.

If you've discovered a security vulnerability in Mercenary, we appreciate your help in disclosing it to us in a responsible manner.

### How to Report

1. **Email Us**: Contact our security team at [security@mercenary.example.com](mailto:security@mercenary.example.com) with details about the vulnerability.

2. **Encryption**: For sensitive reports, encrypt your email using our PGP key (available upon request).

3. **Response Time**: We will acknowledge receipt within 48 hours and provide a detailed response within 5 business days.

For more detailed information about our security policies, including our complete vulnerability disclosure process, security architecture, and best practices, please see the [SECURITY_GUIDE.md](SECURITY_GUIDE.md) document.

## Security Updates

We are committed to addressing security issues promptly. When security vulnerabilities are reported:

1. We will confirm the vulnerability and determine affected versions

2. Develop and test a fix

3. Release an update as quickly as possible

4. Publicly disclose the vulnerability after a fix is available

For the most current information about security updates, please refer to our [CHANGELOG.md](CHANGELOG.md).

- We will notify you when the vulnerability has been fixed.
- We will credit you for discovering the vulnerability (unless you prefer to remain anonymous).
- We will not take legal action against you or ask law enforcement to investigate you if you act in good faith.

### Safe Harbor

Any activities conducted in a manner consistent with this policy will be considered authorized conduct and we will not initiate legal action against you. If legal action is initiated by a third party against you and you have complied with this policy, we will take steps to make it known that your actions were conducted in compliance with this policy.

## Security Best Practices

### For Users

- Always keep your dependencies up to date
- Use strong, unique passwords
- Enable two-factor authentication where available
- Regularly review your account activity
- Be cautious with third-party integrations

### For Developers

- Follow secure coding practices
- Keep all dependencies up to date
- Use parameterized queries to prevent SQL injection
- Validate and sanitize all user inputs
- Implement proper authentication and authorization
- Use HTTPS for all communications
- Implement rate limiting and request validation
- Keep sensitive information out of version control
- Regularly audit your code for security vulnerabilities

## Security Advisories

Security advisories for Mercenary are published on our [GitHub Security Advisories](https://github.com/yourusername/mercenary/security/advisories) page.

## Responsible Disclosure Timeline

We are committed to addressing security issues in a timely manner. Here's our typical timeline for addressing reported vulnerabilities:

- **Time to Triage**: 1-2 business days
- **Time to Fix**: 1-2 weeks (depending on complexity)
- **Public Disclosure**: 1 week after the fix is released

## Security Updates and Notifications

To receive security updates, please "Watch" the repository on GitHub and select "Releases only" to be notified of new security releases.

## Contact

For any security-related questions or concerns, please contact us at [security@mercenary.example.com](mailto:security@mercenary.example.com).

## Credits

We would like to thank the following individuals who have helped make Mercenary more secure by responsibly disclosing security vulnerabilities:

- [Your Name Here] - For reporting [Vulnerability Description]

## Legal

This security policy is adapted from the [GitHub Security Policy Template](https://github.com/github/security-policy-template).
