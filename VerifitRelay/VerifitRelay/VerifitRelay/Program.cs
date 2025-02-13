﻿using SignalWire.Relay;
using SignalWire.Relay.Messaging;
using System;
using System.Collections.Generic;

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
                    Console.WriteLine("Message received : " + message.Body);


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
                    }
                    //if from+to+direction does not exist, create record
                    else
                    {
                        conversation = new ConversationDetails();
                        conversation.ConversationId = singleMessage.FromPhoneNumber + singleMessage.ToPhoneNumber;
                        conversation.FromPhoneNumber = singleMessage.FromPhoneNumber;
                        conversation.ToPhoneNumber = singleMessage.ToPhoneNumber;
                        conversation.LastMessage = singleMessage.Body;
                        conversation.LastMessageTime = singleMessage.Time;

                        db.ConversationDetails.Add(conversation);
                    }


                    //Check from=to, to=from
                    conversation = null;
                    foreach (ConversationDetails conv in db.ConversationDetails)
                    {
                        if ((conv.FromPhoneNumber == singleMessage.ToPhoneNumber) && (conv.ToPhoneNumber == singleMessage.FromPhoneNumber))
                        {
                            conversation = conv;
                        }
                    }
                    //If from+to+direction exists, update record
                    if (conversation != null)
                    {
                        conversation.LastMessage = singleMessage.Body;
                        conversation.LastMessageTime = singleMessage.Time;
                    }
                    //if from+to+direction does not exist, create record
                    else
                    {
                        conversation = new ConversationDetails();
                        conversation.ConversationId = singleMessage.ToPhoneNumber + singleMessage.FromPhoneNumber;
                        conversation.FromPhoneNumber = singleMessage.ToPhoneNumber;
                        conversation.ToPhoneNumber = singleMessage.FromPhoneNumber;
                        conversation.LastMessage = singleMessage.Body;
                        conversation.LastMessageTime = singleMessage.Time;

                        db.ConversationDetails.Add(conversation);
                    }

                    db.SaveChanges();



                    //What if user does not exist in DB for other end of the conversation?


                }
            }

        }

    }
}
