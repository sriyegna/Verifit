using System;
using System.Collections.Generic;
using System.Diagnostics;
using SignalWire.Relay;
using SignalWire.Relay.Messaging;

namespace VerifitRelay
{
    class Program
    {
        static void Main(string[] args)
        {

            Console.WriteLine("Hello World!");

            new IncomingMessageConsumer().Run();
        }

        internal class IncomingMessageConsumer : Consumer
        {
            protected override void Setup()
            {
                Project = "28361e6c-85b8-40f5-bde1-bfc8cf68a96c";
                Token = "PT65bfa7479efd98c38f525e7c352277e70aff63ef22f4e8be";
                Contexts = new List<string> { "Verifit" };
            }

            protected override void OnIncomingMessage(Message message)
            {

                using (var db = new PhoneDetailDBContext())
                {

                    //Add incoming message to database
                    MessageDetails singleMessage = new MessageDetails
                    {
                        //UserName = username,
                        MessageSid = message.ID,
                        Body = message.Body,
                        Time = DateTime.UtcNow.ToString(),
                        Direction = message.Direction.ToString(),
                        FromPhoneNumber = message.From,
                        ToPhoneNumber = message.To
                    };
                    db.MessageDetails.Add(singleMessage);
                    var count = db.SaveChanges();
                    Console.WriteLine("Saved Message to DB" + count);


                    //Populate conversation database

                    //Check from=from, to=to
                    ConversationDetails conversation = null;
                    foreach (ConversationDetails conv in db.ConversationDetails)
                    {
                        if ((conv.FromPhoneNumber == singleMessage.FromPhoneNumber) && (conv.ToPhoneNumber == singleMessage.ToPhoneNumber))
                        {
                            conversation = conv;
                        }
                    }
                    //If from+to+direction exists, update record
                    if (conversation != null)
                    {
                        conversation.LastMessage = singleMessage.Body;
                        conversation.LastMessageTime = singleMessage.Time;
                        db.ConversationDetails.Update(conversation);
                    }
                    //if from+to+direction does not exist, create record
                    else
                    {
                        conversation.ConversationId = singleMessage.FromPhoneNumber + singleMessage.ToPhoneNumber;
                        //Loop through PhoneDetails and find where From=Num and select that user
                        foreach (PhoneDetails phone in db.PhoneDetails)
                        {
                            if (phone.PhoneNumber == conversation.FromPhoneNumber)
                            {
                                conversation.UserName = phone.UserName;
                            }
                        }
                        conversation.UserName = "";
                        conversation.FromPhoneNumber = singleMessage.FromPhoneNumber;
                        conversation.ToPhoneNumber = singleMessage.ToPhoneNumber;
                        conversation.LastMessage = singleMessage.Body;
                        conversation.LastMessageTime = singleMessage.Time;
                    }

                    //What if user does not exist in DB for other end of the conversation?


                }
            }

        }

    }
}
