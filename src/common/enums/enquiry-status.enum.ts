export enum EnquiryStatus {
    NEW = 'new',                   // Just submitted, no action taken yet
    ASSIGNED = 'assigned',         // Assigned to a team member
    IN_PROGRESS = 'in_progress',   // Being handled/responded to
    FOLLOW_UP = 'follow_up',       // Waiting for user/client response
    CONVERTED = 'converted',       // Converted into a lead/customer
    REJECTED = 'rejected',         // Marked as spam, invalid, or irrelevant
    CLOSED = 'closed',             // Inquiry completed and closed
}
