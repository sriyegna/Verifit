using System;
using System.Collections.Generic;

namespace VerifitRelay
{
    public partial class MessageDetails
    {
        public string MessageSid { get; set; }
        public string Body { get; set; }
        public string Time { get; set; }
        public string Direction { get; set; }
        public string FromPhoneNumber { get; set; }
        public string ToPhoneNumber { get; set; }
    }
}
