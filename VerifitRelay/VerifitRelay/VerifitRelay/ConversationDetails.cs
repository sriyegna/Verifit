using System;
using System.Collections.Generic;

namespace VerifitRelay
{
    public partial class ConversationDetails
    {
        public string ConversationId { get; set; }
        public string FromPhoneNumber { get; set; }
        public string ToPhoneNumber { get; set; }
        public string LastMessage { get; set; }
        public string LastMessageTime { get; set; }
        public string ConversationName { get; set; }
    }
}
