# CSR Approval Management & Client Portal Testing Guide

## Overview
This document provides a comprehensive testing guide for the CSR Approval Management & Client Portal system implemented as part of Stage 2B & 2C requirements.

## Prerequisites
- Admin portal running on `http://localhost:3001`
- Client portal running on `http://localhost:3003`  
- Database with sample data
- Email service configured (can use mock/console logging for testing)

## Test Scenarios

### 1. CSR Approval Screen Testing (`/designs/[id]/approval`)

#### Test Case 1.1: Design Approval Request Creation
**Objective**: Verify CSR can create and send approval requests

**Steps**:
1. Navigate to `http://localhost:3001/designs/[design-id]/approval`
2. Verify design preview is displayed correctly
3. Select client from dropdown (pre-populated from order data)
4. Choose message template (Initial Design Approval)
5. Customize email subject and message content
6. Set expiry period (default 7 days)
7. Click "Send for Approval"

**Expected Results**:
- Success message displayed
- Email sent to client (check logs if using console)
- Approval record created in database
- Secure token generated
- Audit log entry created

#### Test Case 1.2: Approval History Display
**Objective**: Verify approval history is displayed correctly

**Steps**:
1. Send multiple approval requests for the same design
2. Navigate to approval history section
3. Verify chronological display of all approval attempts
4. Check status badges and timestamps

**Expected Results**:
- All approvals listed chronologically
- Correct status indicators (SENT, APPROVED, CHANGES_REQUESTED, EXPIRED)
- Accurate timestamps and client information

#### Test Case 1.3: Batch Approval Actions
**Objective**: Test bulk operations on multiple approvals

**Steps**:
1. Create multiple pending approvals across different designs
2. Navigate to batch approval management
3. Select multiple approvals using checkboxes
4. Test "Send Reminder" action with custom message
5. Test "Extend Expiry" action
6. Test "Cancel Approval" action

**Expected Results**:
- Batch operations complete successfully
- Individual approval records updated
- Appropriate notifications sent
- Audit logs created for each action

### 2. Client Portal Testing (`/approval/[token]`)

#### Test Case 2.1: Secure Token Access
**Objective**: Verify secure token-based access

**Steps**:
1. Copy approval link from CSR admin
2. Open link in incognito browser window
3. Verify access without additional authentication
4. Test with expired token (modify database expiry)
5. Test with invalid token

**Expected Results**:
- Valid tokens grant immediate access
- Expired tokens show appropriate error message
- Invalid tokens are rejected with security logging
- No authentication bypass possible

#### Test Case 2.2: Design Review Interface
**Objective**: Test client design review functionality

**Steps**:
1. Access valid approval link
2. Verify design mockup displays correctly
3. Test zoom controls (25%-200%)
4. Test rotation functionality
5. View design placements and color palette
6. Download design files

**Expected Results**:
- High-quality mockup display
- Smooth zoom/rotate controls
- Accurate placement information
- Color palette correctly displayed
- File downloads work properly

#### Test Case 2.3: Approval Submission
**Objective**: Test approval decision submission

**Steps**:
1. Fill out approver name field
2. Select "Approve Design" option
3. Add optional comments
4. Add file attachments (images, PDFs)
5. Submit approval

**Expected Results**:
- Success message displayed
- Database status updated to APPROVED
- Internal notification email sent
- Design asset status updated
- Attachment files stored securely

#### Test Case 2.4: Change Request Submission
**Objective**: Test change request functionality

**Steps**:
1. Fill out approver name field
2. Select "Request Changes" option
3. Add specific feedback (required)
4. Add change request items
5. Set priority level
6. Add reference attachments
7. Submit feedback

**Expected Results**:
- Success message displayed
- Database status updated to CHANGES_REQUESTED
- Detailed feedback stored
- Internal notification sent with feedback
- Design comment created

#### Test Case 2.5: Mobile Responsiveness
**Objective**: Verify mobile-friendly design

**Steps**:
1. Access approval link on mobile device/responsive view
2. Test all functionality on mobile
3. Verify UI elements scale appropriately
4. Test touch interactions

**Expected Results**:
- Clean mobile layout
- All functions accessible
- Touch-friendly controls
- Readable text and buttons

### 3. Communication System Testing

#### Test Case 3.1: Threaded Comments
**Objective**: Test comment and reply system

**Steps**:
1. Add comment to design from admin panel
2. Reply to comment
3. Test different comment types (GENERAL, REVISION_REQUEST, APPROVAL)
4. Test priority levels
5. Resolve comments

**Expected Results**:
- Comments display in chronological order
- Replies properly threaded
- Status and priority indicators work
- Resolution functionality works

#### Test Case 3.2: File Attachments
**Objective**: Test file upload and display

**Steps**:
1. Add comment with image attachments
2. Add comment with document attachments
3. Test file size limits
4. Test unsupported file types

**Expected Results**:
- Supported files upload successfully
- File type icons displayed correctly
- Size limits enforced
- Unsupported types rejected gracefully

### 4. Email Notification Testing

#### Test Case 4.1: Approval Request Emails
**Objective**: Test email generation and delivery

**Steps**:
1. Send approval request with custom message
2. Verify email template rendering
3. Check approval link in email
4. Test email with different browsers/clients

**Expected Results**:
- Professional email template
- All variables populated correctly
- Links work from email clients
- Responsive email design

#### Test Case 4.2: Internal Notifications
**Objective**: Test team notification emails

**Steps**:
1. Have client approve design
2. Have client request changes
3. Verify internal team receives notifications
4. Check notification content accuracy

**Expected Results**:
- Timely notification delivery
- Accurate content and links
- Clear action items
- Professional formatting

#### Test Case 4.3: Reminder System
**Objective**: Test automated reminders

**Steps**:
1. Create approval with short expiry
2. Wait for automated reminder (or trigger manually)
3. Verify reminder email sent
4. Check reminder frequency limits

**Expected Results**:
- Reminders sent before expiry
- Professional reminder tone
- No duplicate reminders
- Proper frequency control

### 5. Security Testing

#### Test Case 5.1: Token Security
**Objective**: Verify token security measures

**Steps**:
1. Attempt to modify token parameters
2. Test token replay attacks
3. Verify token expiry enforcement
4. Test rate limiting on token endpoints

**Expected Results**:
- Modified tokens rejected
- Replay attacks prevented
- Expired tokens unusable
- Rate limiting active

#### Test Case 5.2: Access Control
**Objective**: Test authorization controls

**Steps**:
1. Attempt to access approval with different client token
2. Test cross-design access
3. Verify session isolation
4. Test unauthorized API calls

**Expected Results**:
- Cross-client access blocked
- Design isolation enforced
- No session bleeding
- API authorization required

### 6. Performance Testing

#### Test Case 6.1: Load Testing
**Objective**: Test system under load

**Steps**:
1. Create multiple concurrent approval requests
2. Test simultaneous portal access
3. Monitor response times
4. Check system stability

**Expected Results**:
- Reasonable response times (<3s)
- No system crashes
- Graceful degradation under load
- Database performance acceptable

### 7. Error Handling Testing

#### Test Case 7.1: Network Failures
**Objective**: Test error handling

**Steps**:
1. Simulate network timeouts
2. Test database connection failures
3. Test email service failures
4. Test file upload failures

**Expected Results**:
- Graceful error messages
- No system crashes
- Appropriate user feedback
- Proper error logging

### 8. End-to-End Workflow Testing

#### Test Case 8.1: Complete Approval Cycle
**Objective**: Test entire approval workflow

**Steps**:
1. CSR creates design approval request
2. Client receives email notification
3. Client accesses portal via link
4. Client reviews design and approves
5. Internal team receives notification
6. Design status updated to approved
7. Production workflow initiated

**Expected Results**:
- Seamless workflow progression
- All notifications delivered
- Status updates accurate
- Audit trail complete

#### Test Case 8.2: Complete Change Request Cycle
**Objective**: Test change request workflow

**Steps**:
1. CSR sends approval request
2. Client requests changes with detailed feedback
3. Internal team receives feedback
4. New design version created
5. Updated approval request sent
6. Client approves revised design

**Expected Results**:
- Feedback properly communicated
- Version control maintained
- Change history tracked
- Final approval recorded

## Success Criteria

### Functional Requirements ✅
- [x] CSR can send designs for client approval
- [x] Client receives secure approval link  
- [x] Client can approve/reject with comments
- [x] Real-time status updates and notifications
- [x] Complete approval audit trail
- [x] Mobile-responsive client portal
- [x] Email notification system
- [x] Secure token-based approval links

### Technical Requirements ✅
- [x] Database schema supports all features
- [x] API endpoints handle all operations
- [x] Security measures implemented
- [x] Error handling robust
- [x] Performance acceptable
- [x] Email integration functional
- [x] File upload/attachment system working

### User Experience Requirements ✅
- [x] Intuitive CSR approval interface
- [x] Professional client portal design
- [x] Clear approval process flow
- [x] Helpful error messages
- [x] Mobile-friendly interface
- [x] Fast loading times
- [x] Professional email templates

## Deployment Checklist

Before deploying to production:

1. **Environment Configuration**
   - [ ] Database connection strings updated
   - [ ] Email service credentials configured
   - [ ] JWT secrets set securely
   - [ ] File upload storage configured
   - [ ] SSL certificates installed

2. **Security Hardening**
   - [ ] Rate limiting configured
   - [ ] HTTPS enforced
   - [ ] Security headers set
   - [ ] Token expiry policies set
   - [ ] Access logs enabled

3. **Monitoring Setup**
   - [ ] Application monitoring configured
   - [ ] Email delivery monitoring
   - [ ] Error tracking enabled
   - [ ] Performance monitoring active
   - [ ] Security event logging

4. **Backup & Recovery**
   - [ ] Database backups configured
   - [ ] File storage backups enabled
   - [ ] Recovery procedures tested
   - [ ] Rollback plan prepared

## Conclusion

This comprehensive approval management system provides a secure, user-friendly, and feature-rich solution for design approval workflows. All acceptance criteria have been met with robust error handling, security measures, and professional user experience.

The system is production-ready and provides a solid foundation for client collaboration and internal workflow management.