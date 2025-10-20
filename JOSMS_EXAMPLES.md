# JOSMS SMS Service - GraphQL Examples

## Setup

The JOSMS service is configured and ready to use. Access the GraphQL Playground at: `http://localhost:4001/api/graphql`

**Note:** All SMS operations require authentication and either ADMIN or SUPER_ADMIN role.

## Environment Variables

Make sure these are set in your `.env` file:
```env
JOSMS_ACC_NAME=your_account_name
JOSMS_ACC_PASS=your_account_password
JOSMS_SENDER_ID=your_sender_id
```

## Authentication

First, you need to login to get a JWT token:

```graphql
mutation Login {
  login(email: "admin@example.com", password: "your_password") {
    access_token
    user {
      id
      email
      role
    }
  }
}
```

Then add the token to HTTP Headers in GraphQL Playground:
```json
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN_HERE"
}
```

## 1. Check SMS Balance

Query to check your JOSMS account balance:

```graphql
query GetSMSBalance {
  smsBalance {
    success
    balance
    currency
    error
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "smsBalance": {
      "success": true,
      "balance": 150.50,
      "currency": "JOD",
      "error": null
    }
  }
}
```

## 2. Send Single SMS

### General Message

```graphql
mutation SendGeneralSMS {
  sendSMS(input: {
    phoneNumber: "0791234567"
    message: "Hello from Adlaan Legal System! Your case has been updated."
    type: GENERAL
    messageId: "case-update-123"
  }) {
    success
    messageId
    response
    error
  }
}
```

### OTP Message

```graphql
mutation SendOTP {
  sendSMS(input: {
    phoneNumber: "962791234567"
    message: "Your verification code is: 123456. Valid for 5 minutes."
    type: OTP
    messageId: "otp-123456"
  }) {
    success
    messageId
    response
    error
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "sendSMS": {
      "success": true,
      "messageId": "otp-123456",
      "response": "Message sent successfully",
      "error": null
    }
  }
}
```

## 3. Send Bulk SMS

Send the same message to multiple recipients (max 120):

```graphql
mutation SendBulkNotifications {
  sendBulkSMS(input: {
    phoneNumbers: [
      "0791234567",
      "0792345678",
      "0793456789",
      "962794567890"
    ]
    message: "Court hearing scheduled for tomorrow at 10:00 AM. Case #2024-001"
    senderId: "Adlaan"
    messageId: "bulk-notification-001"
  }) {
    success
    messageId
    response
    error
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "sendBulkSMS": {
      "success": true,
      "messageId": "bulk-notification-001",
      "response": "Bulk messages sent successfully to 4 recipients",
      "error": null
    }
  }
}
```

## Phone Number Formats

The service accepts multiple phone number formats and automatically normalizes them:

- `0791234567` → converts to `962791234567`
- `00962791234567` → converts to `962791234567`
- `+962791234567` → converts to `962791234567`
- `962791234567` → no change (already correct)

## Message Length Limits

The service automatically validates message length based on character type:

### Arabic Messages
- **Single SMS:** 70 characters
- **Concatenated:** 62 characters per part

### English/Latin Messages
- **Single SMS:** 160 characters
- **Concatenated:** 152 characters per part

## Error Handling

If an error occurs, you'll receive a response like:

```json
{
  "data": {
    "sendSMS": {
      "success": false,
      "messageId": null,
      "response": null,
      "error": "Invalid phone number format"
    }
  }
}
```

Common errors:
- `Invalid phone number format` - Phone number doesn't match expected format
- `Message too long` - Message exceeds character limit for single SMS
- `Insufficient balance` - Not enough credit in JOSMS account
- `Invalid credentials` - JOSMS_ACC_NAME or JOSMS_ACC_PASS incorrect

## Integration Examples

### Send SMS when Case is Created

```typescript
// In case.service.ts
async createCase(createCaseInput: CreateCaseInput, userId: number) {
  const case = await this.caseRepository.save({
    ...createCaseInput,
    companyId: userId,
  });

  // Send SMS notification to client
  if (case.client?.phone) {
    await this.josmsService.sendSMS(
      case.client.phone,
      `Your case ${case.caseNumber} has been created successfully. We will contact you soon.`,
      { type: JOSMSMessageType.GENERAL }
    );
  }

  return case;
}
```

### Send OTP for Two-Factor Authentication

```typescript
// In auth.service.ts
async sendLoginOTP(phoneNumber: string) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP in cache/database with expiry
  await this.cacheManager.set(`otp:${phoneNumber}`, otp, 300); // 5 minutes
  
  // Send OTP via SMS
  const result = await this.josmsService.sendOTPMessage(
    phoneNumber,
    otp,
    5,
    'login-otp'
  );
  
  return result.success;
}
```

### Send Bulk Notifications to Case Team

```typescript
// In case.service.ts
async notifyCaseTeam(caseId: number, message: string) {
  const case = await this.findOne(caseId);
  
  const phoneNumbers = case.assignedUsers
    .map(user => user.phone)
    .filter(phone => phone); // Remove null/undefined
  
  if (phoneNumbers.length > 0) {
    await this.josmsService.sendBulkMessages({
      numbers: phoneNumbers,
      message: `Case ${case.caseNumber}: ${message}`,
      messageId: `case-${caseId}-notification`,
    });
  }
}
```

## Testing Checklist

- [ ] Server starts without errors ✅
- [ ] Login as ADMIN user
- [ ] Query `smsBalance` - should return balance
- [ ] Send single SMS (GENERAL type)
- [ ] Send OTP message
- [ ] Send bulk SMS to multiple numbers
- [ ] Test with different phone number formats
- [ ] Verify error handling with invalid inputs
- [ ] Check that USER role cannot access SMS endpoints (should get authorization error)

## Next Steps

1. **Test the Balance Query** - Verify your JOSMS credentials are working
2. **Send a Test SMS** - Try sending to your own phone number
3. **Integrate with Business Logic** - Add SMS notifications to case/document workflows
4. **Monitor Usage** - Check balance regularly to avoid service interruption
5. **Add SMS Audit Log** - Consider creating an SMSLog entity to track all sent messages

## Support

- JOSMS Dashboard: https://josms.net
- API Documentation: Check JOSMS provider documentation
- Error Logs: Check NestJS console output for detailed error messages
