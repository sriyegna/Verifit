using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhoneAPI.Models;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Rest.Api.V2010.Account.AvailablePhoneNumberCountry;
using System.Linq;
using VerifitServer.Models;
using System.Diagnostics;

namespace VerifitServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PhoneDetailController : ControllerBase
    {
        private readonly PhoneDetailContext _context;
        private readonly MessageDetailContext _messageContext;
        private readonly ConversationDetailContext _conversationContext;

        public PhoneDetailController(PhoneDetailContext context, MessageDetailContext messageContext, ConversationDetailContext conversationContext)
        {
            _context = context;
            _messageContext = messageContext;
            _conversationContext = conversationContext;
        }


        // Get Phone numbers for User
        // GET: api/PhoneDetails
        [HttpGet("GetUserPhoneNumbers/{username}")]
        public async Task<ActionResult<IEnumerable<PhoneDetail>>> GetUserPhoneNumbers(string username)
        {
            Console.WriteLine(username);
            var newResult = await _context.PhoneDetails.Where(a => (a.UserName == username)).ToListAsync();

            //Update messages for all user phone numbers
            foreach (var result in newResult)
            {
                Debug.WriteLine(result.PhoneNumber);

                TwilioClient.Init("28361e6c-85b8-40f5-bde1-bfc8cf68a96c", "PT65bfa7479efd98c38f525e7c352277e70aff63ef22f4e8be", new Dictionary<string, object> { ["signalwireSpaceUrl"] = "manish.signalwire.com" });
                var messagesFrom = MessageResource.Read(
                    from: new Twilio.Types.PhoneNumber(result.PhoneNumber)
                    );
                var messagesTo = MessageResource.Read(
                to: new Twilio.Types.PhoneNumber(result.PhoneNumber)
                );

                Debug.WriteLine("From");
                foreach (var record in messagesFrom)
                {
                    Console.WriteLine(record.Sid);
                    Debug.WriteLine("Debug code1");
                    Debug.WriteLine(record.Sid);
                    var messageDetail = await _messageContext.MessageDetails.FindAsync(record.Sid);
                    if (messageDetail == null)
                    {
                        MessageDetail singleMessage = new MessageDetail
                        {
                            UserName = username,
                            MessageSid = record.Sid,
                            Body = record.Body,
                            TimeCreated = (record.DateCreated).ToString(),
                            TimeSent = (record.DateSent).ToString(),
                            Direction = (record.Direction).ToString(),
                            FromPhoneNumber = (record.From).ToString(),
                            ToPhoneNumber = (record.To).ToString()
                        };
                        _messageContext.MessageDetails.Add(singleMessage);
                    }

                }
                Debug.WriteLine("To");
                foreach (var record in messagesTo)
                {
                    Console.WriteLine(record.Sid);
                    Debug.WriteLine("Debug code2");
                    Debug.WriteLine(record.Sid);
                    var messageDetail = await _messageContext.MessageDetails.FindAsync(record.Sid);
                    if (messageDetail == null)
                    {
                        MessageDetail singleMessage = new MessageDetail
                        {
                            UserName = username,
                            MessageSid = record.Sid,
                            Body = record.Body,
                            TimeCreated = (record.DateCreated).ToString(),
                            TimeSent = (record.DateSent).ToString(),
                            Direction = (record.Direction).ToString(),
                            FromPhoneNumber = (record.From).ToString(),
                            ToPhoneNumber = (record.To).ToString()
                        };
                        _messageContext.MessageDetails.Add(singleMessage);
                    }
                }
                await _messageContext.SaveChangesAsync();

                //Update conversation tables
                var messagelist = await _messageContext.MessageDetails.Where(a => ((a.FromPhoneNumber == result.PhoneNumber) || (a.ToPhoneNumber == result.PhoneNumber))).ToListAsync();
                List<string> conversationNumbers = new List<string>();
                foreach (var message in messagelist)
                {
                    if (message.FromPhoneNumber == result.PhoneNumber)
                    {
                        conversationNumbers.Add(message.ToPhoneNumber);
                    }
                    else
                    {
                        conversationNumbers.Add(message.FromPhoneNumber);
                    }
                }

                foreach (var conversationNumber in conversationNumbers)
                {
                    var conversationDetail = await _conversationContext.ConversationDetails.FindAsync(username + result.PhoneNumber + conversationNumber);
                    //If conversationDetail is NOT NULL, that means that we found a matching PKey, we need to UPDATE the record if the timestamp is newer. We can also set LastMessageTime to the current time of the found conversation.
                    //We cannot use the same Add function because the PKey already exists
                    if (conversationDetail == null)
                    {
                        Debug.WriteLine("Looping ConversationNumber");
                        var numberMessageList = await _messageContext.MessageDetails.Where(a => ((a.UserName == username) && (a.FromPhoneNumber == conversationNumber) || (a.ToPhoneNumber == conversationNumber))).ToListAsync();
                        ConversationDetail singleConversation = new ConversationDetail
                        {
                            ConversationId = username + result.PhoneNumber + conversationNumber,
                            UserName = username,
                            FromPhoneNumber = result.PhoneNumber,
                            ToPhoneNumber = conversationNumber,
                            LastMessage = "",
                            LastMessageTime = "1/1/0001 12:00:00 AM"
                        };
                        foreach (var numberMessage in numberMessageList)
                        {
                            DateTime lastMessageTime = DateTime.Parse(singleConversation.LastMessageTime);
                            DateTime numberMessageDate = DateTime.Parse(numberMessage.TimeCreated);
                            if (DateTime.Compare(lastMessageTime, numberMessageDate) < 0)
                            {
                                singleConversation.LastMessageTime = numberMessage.TimeCreated;
                                singleConversation.LastMessage = numberMessage.Body;
                            }
                            Debug.WriteLine(numberMessage.TimeCreated);
                        }
                        _conversationContext.ConversationDetails.Add(singleConversation);
                    }
                    else
                    {
                        Debug.Write("Updating Conversation Found");
                        var numberMessageList = await _messageContext.MessageDetails.Where(a => ((a.UserName == username) && (a.FromPhoneNumber == conversationNumber) || (a.ToPhoneNumber == conversationNumber))).ToListAsync();
                        ConversationDetail singleConversation = new ConversationDetail
                        {
                            ConversationId = username + result.PhoneNumber + conversationNumber,
                            UserName = username,
                            FromPhoneNumber = result.PhoneNumber,
                            ToPhoneNumber = conversationNumber,
                            LastMessage = conversationDetail.LastMessage,
                            LastMessageTime = conversationDetail.LastMessageTime
                        };
                        foreach (var numberMessage in numberMessageList)
                        {
                            DateTime lastMessageTime = DateTime.Parse(singleConversation.LastMessageTime);
                            DateTime numberMessageDate = DateTime.Parse(numberMessage.TimeCreated);
                            if (DateTime.Compare(lastMessageTime, numberMessageDate) < 0)
                            {
                                singleConversation.LastMessageTime = numberMessage.TimeCreated;
                                singleConversation.LastMessage = numberMessage.Body;
                            }
                            Debug.WriteLine(numberMessage.TimeCreated);
                        }
                        ConversationDetail conversationToUpdate = _conversationContext.ConversationDetails.Where(a => (a.ConversationId == username + result.PhoneNumber + conversationNumber)).FirstOrDefault();
                        if (conversationToUpdate != null) {
                            conversationToUpdate.LastMessageTime = singleConversation.LastMessageTime;
                            conversationToUpdate.LastMessage = singleConversation.LastMessage;
                            //await _conversationContext.SaveChangesAsync();
                        }

                    }
                }
                await _conversationContext.SaveChangesAsync();
            }           
            return newResult;
        }


        // Get Phone numbers for User
        // GET: api/PhoneDetails
        [HttpGet("UpdatePhoneConversations/{username}&{phone}")]
        public async Task<ActionResult<IEnumerable<ConversationDetail>>> UpdatePhoneConversations(string username, string phone)
        {
            phone = "+" + phone;
                       
            //Update conversation tables
            var messagelist = await _messageContext.MessageDetails.Where(a => ((a.FromPhoneNumber == phone) || (a.ToPhoneNumber == phone))).ToListAsync();
            List<string> conversationNumbers = new List<string>();
            foreach (var message in messagelist)
            {
                if (message.FromPhoneNumber == phone)
                {
                    conversationNumbers.Add(message.ToPhoneNumber);
                }
                else
                {
                    conversationNumbers.Add(message.FromPhoneNumber);
                }
            }

            foreach (var conversationNumber in conversationNumbers)
            {
                var conversationDetail = await _conversationContext.ConversationDetails.FindAsync(username + phone + conversationNumber);
                //If conversationDetail is NOT NULL, that means that we found a matching PKey, we need to UPDATE the record if the timestamp is newer. We can also set LastMessageTime to the current time of the found conversation.
                //We cannot use the same Add function because the PKey already exists
                if (conversationDetail == null)
                {
                    Debug.WriteLine("Looping ConversationNumber");
                    var numberMessageList = await _messageContext.MessageDetails.Where(a => ((a.UserName == username) && (a.FromPhoneNumber == conversationNumber) || (a.ToPhoneNumber == conversationNumber))).ToListAsync();
                    ConversationDetail singleConversation = new ConversationDetail
                    {
                        ConversationId = username + phone + conversationNumber,
                        UserName = username,
                        FromPhoneNumber = phone,
                        ToPhoneNumber = conversationNumber,
                        LastMessage = "",
                        LastMessageTime = "1/1/0001 12:00:00 AM"
                    };
                    foreach (var numberMessage in numberMessageList)
                    {
                        DateTime lastMessageTime = DateTime.Parse(singleConversation.LastMessageTime);
                        DateTime numberMessageDate = DateTime.Parse(numberMessage.TimeCreated);
                        if (DateTime.Compare(lastMessageTime, numberMessageDate) < 0)
                        {
                            singleConversation.LastMessageTime = numberMessage.TimeCreated;
                            singleConversation.LastMessage = numberMessage.Body;
                        }
                        Debug.WriteLine(numberMessage.TimeCreated);
                    }
                    _conversationContext.ConversationDetails.Add(singleConversation);
                }
                else
                {
                    Debug.Write("Updating Conversation Found");
                    var numberMessageList = await _messageContext.MessageDetails.Where(a => ((a.UserName == username) && (a.FromPhoneNumber == conversationNumber) || (a.ToPhoneNumber == conversationNumber))).ToListAsync();
                    ConversationDetail singleConversation = new ConversationDetail
                    {
                        ConversationId = username + phone + conversationNumber,
                        UserName = username,
                        FromPhoneNumber = phone,
                        ToPhoneNumber = conversationNumber,
                        LastMessage = conversationDetail.LastMessage,
                        LastMessageTime = conversationDetail.LastMessageTime
                    };
                    foreach (var numberMessage in numberMessageList)
                    {
                        DateTime lastMessageTime = DateTime.Parse(singleConversation.LastMessageTime);
                        DateTime numberMessageDate = DateTime.Parse(numberMessage.TimeCreated);
                        if (DateTime.Compare(lastMessageTime, numberMessageDate) < 0)
                        {
                            singleConversation.LastMessageTime = numberMessage.TimeCreated;
                            singleConversation.LastMessage = numberMessage.Body;
                        }
                        Debug.WriteLine(numberMessage.TimeCreated);
                    }
                    ConversationDetail conversationToUpdate = _conversationContext.ConversationDetails.Where(a => (a.ConversationId == username + phone + conversationNumber)).FirstOrDefault();
                    if (conversationToUpdate != null)
                    {
                        conversationToUpdate.LastMessageTime = singleConversation.LastMessageTime;
                        conversationToUpdate.LastMessage = singleConversation.LastMessage;
                        //await _conversationContext.SaveChangesAsync();
                    }
                }
            }
            await _conversationContext.SaveChangesAsync();

            var newResult = await _conversationContext.ConversationDetails.Where(a => ((a.UserName == username) && ((a.ToPhoneNumber == phone) || (a.FromPhoneNumber == phone)))).OrderByDescending(a => DateTime.Parse(a.LastMessageTime)).ToListAsync();
            return newResult;
        }


        // Update for Phone Number
        // GET: api/PhoneDetails
        [HttpGet("GetPhoneConversations/{username}&{phone}")]
        public async Task<ActionResult<PhoneDetail>> GetPhoneConversations(string username, string phone)
        {            //Update messages for all user phone numbers

            phone = "+" + phone;
            PhoneDetail newResult = _context.PhoneDetails.Where(a => (a.PhoneNumber == phone)).FirstOrDefault();

            TwilioClient.Init("28361e6c-85b8-40f5-bde1-bfc8cf68a96c", "PT65bfa7479efd98c38f525e7c352277e70aff63ef22f4e8be", new Dictionary<string, object> { ["signalwireSpaceUrl"] = "manish.signalwire.com" });
            var messagesFrom = MessageResource.Read(
                from: new Twilio.Types.PhoneNumber(phone)
                );
            var messagesTo = MessageResource.Read(
            to: new Twilio.Types.PhoneNumber(phone)
            );

            Debug.WriteLine("From");
            foreach (var record in messagesFrom)
            {
                Console.WriteLine(record.Sid);
                Debug.WriteLine("Debug code1");
                Debug.WriteLine(record.Sid);
                var messageDetail = await _messageContext.MessageDetails.FindAsync(record.Sid);
                if (messageDetail == null)
                {
                    MessageDetail singleMessage = new MessageDetail
                    {
                        UserName = username,
                        MessageSid = record.Sid,
                        Body = record.Body,
                        TimeCreated = (record.DateCreated).ToString(),
                        TimeSent = (record.DateSent).ToString(),
                        Direction = (record.Direction).ToString(),
                        FromPhoneNumber = (record.From).ToString(),
                        ToPhoneNumber = (record.To).ToString()
                    };
                    _messageContext.MessageDetails.Add(singleMessage);
                }

            }
            Debug.WriteLine("To");
            foreach (var record in messagesTo)
            {
                Console.WriteLine(record.Sid);
                Debug.WriteLine("Debug code2");
                Debug.WriteLine(record.Sid);
                var messageDetail = await _messageContext.MessageDetails.FindAsync(record.Sid);
                if (messageDetail == null)
                {
                    MessageDetail singleMessage = new MessageDetail
                    {
                        UserName = username,
                        MessageSid = record.Sid,
                        Body = record.Body,
                        TimeCreated = (record.DateCreated).ToString(),
                        TimeSent = (record.DateSent).ToString(),
                        Direction = (record.Direction).ToString(),
                        FromPhoneNumber = (record.From).ToString(),
                        ToPhoneNumber = (record.To).ToString()
                    };
                    _messageContext.MessageDetails.Add(singleMessage);
                }
            }
            await _messageContext.SaveChangesAsync();

            //Update conversation tables
            var messagelist = await _messageContext.MessageDetails.Where(a => ((a.FromPhoneNumber == phone) || (a.ToPhoneNumber == phone))).ToListAsync();
            List<string> conversationNumbers = new List<string>();
            foreach (var message in messagelist)
            {
                if (message.FromPhoneNumber == phone)
                {
                    conversationNumbers.Add(message.ToPhoneNumber);
                }
                else
                {
                    conversationNumbers.Add(message.FromPhoneNumber);
                }
            }

            foreach (var conversationNumber in conversationNumbers)
            {
                var conversationDetail = await _conversationContext.ConversationDetails.FindAsync(username + phone + conversationNumber);
                //If conversationDetail is NOT NULL, that means that we found a matching PKey, we need to UPDATE the record if the timestamp is newer. We can also set LastMessageTime to the current time of the found conversation.
                //We cannot use the same Add function because the PKey already exists
                if (conversationDetail == null)
                {
                    Debug.WriteLine("Looping ConversationNumber");
                    var numberMessageList = await _messageContext.MessageDetails.Where(a => ((a.UserName == username) && (a.FromPhoneNumber == conversationNumber) || (a.ToPhoneNumber == conversationNumber))).ToListAsync();
                    ConversationDetail singleConversation = new ConversationDetail
                    {
                        ConversationId = username + phone + conversationNumber,
                        UserName = username,
                        FromPhoneNumber = phone,
                        ToPhoneNumber = conversationNumber,
                        LastMessage = "",
                        LastMessageTime = "1/1/0001 12:00:00 AM"
                    };
                    foreach (var numberMessage in numberMessageList)
                    {
                        DateTime lastMessageTime = DateTime.Parse(singleConversation.LastMessageTime);
                        DateTime numberMessageDate = DateTime.Parse(numberMessage.TimeCreated);
                        if (DateTime.Compare(lastMessageTime, numberMessageDate) < 0)
                        {
                            singleConversation.LastMessageTime = numberMessage.TimeCreated;
                            singleConversation.LastMessage = numberMessage.Body;
                        }
                        Debug.WriteLine(numberMessage.TimeCreated);
                    }
                    _conversationContext.ConversationDetails.Add(singleConversation);
                }
                else
                {
                    Debug.Write("Updating Conversation Found");
                    var numberMessageList = await _messageContext.MessageDetails.Where(a => ((a.UserName == username) && (a.FromPhoneNumber == conversationNumber) || (a.ToPhoneNumber == conversationNumber))).ToListAsync();
                    ConversationDetail singleConversation = new ConversationDetail
                    {
                        ConversationId = username + phone + conversationNumber,
                        UserName = username,
                        FromPhoneNumber = phone,
                        ToPhoneNumber = conversationNumber,
                        LastMessage = conversationDetail.LastMessage,
                        LastMessageTime = conversationDetail.LastMessageTime
                    };
                    foreach (var numberMessage in numberMessageList)
                    {
                        DateTime lastMessageTime = DateTime.Parse(singleConversation.LastMessageTime);
                        DateTime numberMessageDate = DateTime.Parse(numberMessage.TimeCreated);
                        if (DateTime.Compare(lastMessageTime, numberMessageDate) < 0)
                        {
                            singleConversation.LastMessageTime = numberMessage.TimeCreated;
                            singleConversation.LastMessage = numberMessage.Body;
                        }
                        Debug.WriteLine(numberMessage.TimeCreated);
                    }
                    ConversationDetail conversationToUpdate = _conversationContext.ConversationDetails.Where(a => (a.ConversationId == username + phone + conversationNumber)).FirstOrDefault();
                    if (conversationToUpdate != null)
                    {
                        conversationToUpdate.LastMessageTime = singleConversation.LastMessageTime;
                        conversationToUpdate.LastMessage = singleConversation.LastMessage;
                        //await _conversationContext.SaveChangesAsync();
                    }
                }
            }
            await _conversationContext.SaveChangesAsync();
            return newResult;
        }

        // Update for Phone Number
        // GET: api/PhoneDetails
        [HttpGet("GetConversationMessages/{username}&{fromPhoneNumber}&{toPhoneNumber}")]
        public async Task<ActionResult<ConversationDetail>> GetConversationMessages(string username, string fromPhoneNumber, string toPhoneNumber)
        {            //Update messages for all user phone numbers

            fromPhoneNumber = "+" + fromPhoneNumber;
            toPhoneNumber = "+" + toPhoneNumber;

            ConversationDetail newResult = _conversationContext.ConversationDetails.Where(a => ((a.UserName == username.ToLower()) && (a.ToPhoneNumber == toPhoneNumber) && (a.FromPhoneNumber == fromPhoneNumber))).FirstOrDefault();

            TwilioClient.Init("28361e6c-85b8-40f5-bde1-bfc8cf68a96c", "PT65bfa7479efd98c38f525e7c352277e70aff63ef22f4e8be", new Dictionary<string, object> { ["signalwireSpaceUrl"] = "manish.signalwire.com" });
            var messagesFrom = MessageResource.Read(
                from: new Twilio.Types.PhoneNumber(toPhoneNumber)
            );
            var messagesTo = MessageResource.Read(
            to: new Twilio.Types.PhoneNumber(toPhoneNumber)
            );

            Debug.WriteLine("From");
            foreach (var record in messagesFrom)
            {
                Console.WriteLine(record.Sid);
                Debug.WriteLine("Debug code1");
                Debug.WriteLine(record.Sid);
                var messageDetail = await _messageContext.MessageDetails.FindAsync(record.Sid);
                if (messageDetail == null)
                {
                    MessageDetail singleMessage = new MessageDetail
                    {
                        UserName = username,
                        MessageSid = record.Sid,
                        Body = record.Body,
                        TimeCreated = (record.DateCreated).ToString(),
                        TimeSent = (record.DateSent).ToString(),
                        Direction = (record.Direction).ToString(),
                        FromPhoneNumber = (record.From).ToString(),
                        ToPhoneNumber = (record.To).ToString()
                    };
                    _messageContext.MessageDetails.Add(singleMessage);
                }

            }
            Debug.WriteLine("To");
            foreach (var record in messagesTo)
            {
                Console.WriteLine(record.Sid);
                Debug.WriteLine("Debug code2");
                Debug.WriteLine(record.Sid);
                var messageDetail = await _messageContext.MessageDetails.FindAsync(record.Sid);
                if (messageDetail == null)
                {
                    MessageDetail singleMessage = new MessageDetail
                    {
                        UserName = username,
                        MessageSid = record.Sid,
                        Body = record.Body,
                        TimeCreated = (record.DateCreated).ToString(),
                        TimeSent = (record.DateSent).ToString(),
                        Direction = (record.Direction).ToString(),
                        FromPhoneNumber = (record.From).ToString(),
                        ToPhoneNumber = (record.To).ToString()
                    };
                    _messageContext.MessageDetails.Add(singleMessage);
                }
            }
            await _messageContext.SaveChangesAsync();

         
            var conversationDetail = await _conversationContext.ConversationDetails.FindAsync(username + fromPhoneNumber + toPhoneNumber);
            //If conversationDetail is NOT NULL, that means that we found a matching PKey, we need to UPDATE the record if the timestamp is newer. We can also set LastMessageTime to the current time of the found conversation.
            //We cannot use the same Add function because the PKey already exists
            if (conversationDetail == null)
            {
                Debug.WriteLine("Looping ConversationNumber");
                var numberMessageList = await _messageContext.MessageDetails.Where(a => ((a.UserName == username) && (a.FromPhoneNumber == toPhoneNumber) || (a.ToPhoneNumber == toPhoneNumber))).ToListAsync();
                ConversationDetail singleConversation = new ConversationDetail
                {
                    ConversationId = username + fromPhoneNumber + toPhoneNumber,
                    UserName = username,
                    FromPhoneNumber = fromPhoneNumber,
                    ToPhoneNumber = toPhoneNumber,
                    LastMessage = "",
                    LastMessageTime = "1/1/0001 12:00:00 AM"
                };
                foreach (var numberMessage in numberMessageList)
                {
                    DateTime lastMessageTime = DateTime.Parse(singleConversation.LastMessageTime);
                    DateTime numberMessageDate = DateTime.Parse(numberMessage.TimeCreated);
                    if (DateTime.Compare(lastMessageTime, numberMessageDate) < 0)
                    {
                        singleConversation.LastMessageTime = numberMessage.TimeCreated;
                        singleConversation.LastMessage = numberMessage.Body;
                    }
                    Debug.WriteLine(numberMessage.TimeCreated);
                }
                _conversationContext.ConversationDetails.Add(singleConversation);
            }
            else
            {
                Debug.Write("Updating Conversation Found");
                var numberMessageList = await _messageContext.MessageDetails.Where(a => ((a.UserName == username) && (a.FromPhoneNumber == toPhoneNumber) || (a.ToPhoneNumber == toPhoneNumber))).ToListAsync();
                ConversationDetail singleConversation = new ConversationDetail
                {
                    ConversationId = username + fromPhoneNumber + toPhoneNumber,
                    UserName = username,
                    FromPhoneNumber = fromPhoneNumber,
                    ToPhoneNumber = toPhoneNumber,
                    LastMessage = conversationDetail.LastMessage,
                    LastMessageTime = conversationDetail.LastMessageTime
                };
                foreach (var numberMessage in numberMessageList)
                {
                    DateTime lastMessageTime = DateTime.Parse(singleConversation.LastMessageTime);
                    DateTime numberMessageDate = DateTime.Parse(numberMessage.TimeCreated);
                    if (DateTime.Compare(lastMessageTime, numberMessageDate) < 0)
                    {
                        singleConversation.LastMessageTime = numberMessage.TimeCreated;
                        singleConversation.LastMessage = numberMessage.Body;
                    }
                    Debug.WriteLine(numberMessage.TimeCreated);
                }
                ConversationDetail conversationToUpdate = _conversationContext.ConversationDetails.Where(a => (a.ConversationId == username + fromPhoneNumber + toPhoneNumber)).FirstOrDefault();
                if (conversationToUpdate != null)
                {
                    conversationToUpdate.LastMessageTime = singleConversation.LastMessageTime;
                    conversationToUpdate.LastMessage = singleConversation.LastMessage;
                    //await _conversationContext.SaveChangesAsync();
                }
            }
            await _conversationContext.SaveChangesAsync();
            return newResult;
        }

        // GET: api/PhoneDetails
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PhoneDetail>>> GetPhoneDetails()
        {

            return await _context.PhoneDetails.ToListAsync();
        }

        // GET: api/PhoneDetails/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PhoneDetail>> GetPhoneDetail(string id)
        {
            var phoneDetail = await _context.PhoneDetails.FindAsync(id);
                       
            if (phoneDetail == null)
            {
                return NotFound();
            }

            return phoneDetail;
        }

 

        // PUT: api/PhoneDetails/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPhoneDetail(string id, PhoneDetail phoneDetail)
        {
            if (id != phoneDetail.PhoneSid)
            {
                return BadRequest();
            }

            _context.Entry(phoneDetail).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PhoneDetailExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/PhoneDetails
        [HttpPost]
        [Route("RequestCanNumber")]
        public async Task<ActionResult<PhoneDetail>> PostPhoneDetailCan(PhoneDetail phoneDetail)
        {

            //Get Signalwire number
            TwilioClient.Init("28361e6c-85b8-40f5-bde1-bfc8cf68a96c", "PT65bfa7479efd98c38f525e7c352277e70aff63ef22f4e8be", new Dictionary<string, object> { ["signalwireSpaceUrl"] = "manish.signalwire.com" });

            var localAvailableNumbers = LocalResource.Read("CAN", inRegion: "ON");

            var firstNumber = localAvailableNumbers.First();
            var incomingPhoneNumber = IncomingPhoneNumberResource.Create(
                phoneNumber: firstNumber.PhoneNumber);

            //Save it to model
            phoneDetail.UserName = (phoneDetail.UserName).ToLower();
            Console.WriteLine(phoneDetail.UserName);
            phoneDetail.PhoneNumber = incomingPhoneNumber.PhoneNumber.ToString();
            phoneDetail.PhoneSid = incomingPhoneNumber.Sid;
            DateTime createDate = DateTime.Now;
            DateTime expireDate = createDate.AddDays(30);
            phoneDetail.TimeCreated = (createDate.ToString("s"));
            phoneDetail.TimeExpired = (expireDate.ToString("s"));


            _context.PhoneDetails.Add(phoneDetail);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetPhoneDetail", new { id = phoneDetail.PhoneSid }, phoneDetail);
        }

        // POST: api/PhoneDetails
        [HttpPost]
        [Route("RequestUsNumber")]
        public async Task<ActionResult<PhoneDetail>> PostPhoneDetailUs(PhoneDetail phoneDetail)
        {

            //Get Signalwire number
            TwilioClient.Init("28361e6c-85b8-40f5-bde1-bfc8cf68a96c", "PT65bfa7479efd98c38f525e7c352277e70aff63ef22f4e8be", new Dictionary<string, object> { ["signalwireSpaceUrl"] = "manish.signalwire.com" });

            var localAvailableNumbers = LocalResource.Read("US");

            var firstNumber = localAvailableNumbers.First();
            var incomingPhoneNumber = IncomingPhoneNumberResource.Create(
                phoneNumber: firstNumber.PhoneNumber);

            //Save it to model
            Console.WriteLine(phoneDetail.UserName);
            phoneDetail.UserName = (phoneDetail.UserName).ToLower();
            phoneDetail.PhoneNumber = incomingPhoneNumber.PhoneNumber.ToString();
            phoneDetail.PhoneSid = incomingPhoneNumber.Sid;
            DateTime createDate = DateTime.Now;
            DateTime expireDate = createDate.AddDays(30);
            phoneDetail.TimeCreated = (createDate.ToString("s"));
            phoneDetail.TimeExpired = (expireDate.ToString("s"));


            _context.PhoneDetails.Add(phoneDetail);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetPhoneDetail", new { id = phoneDetail.PhoneSid }, phoneDetail);
        }



        // DELETE: api/PhoneDetails/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<PhoneDetail>> DeletePhoneDetail(string id)
        {
            var phoneDetail = await _context.PhoneDetails.FindAsync(id);
            if (phoneDetail == null)
            {
                return NotFound();
            }

            _context.PhoneDetails.Remove(phoneDetail);
            await _context.SaveChangesAsync();

            return phoneDetail;
        }

        private bool PhoneDetailExists(string id)
        {
            return _context.PhoneDetails.Any(e => e.PhoneSid == id);
        }
    }
}
