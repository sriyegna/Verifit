using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using SignalWire.Relay;
using SignalWire.Relay.Calling;
using SignalWire.Relay.Messaging;

namespace VerifitServer.Services
{
    public class OnIncomingMessage
    {
        internal class IncomingMessageConsumer : Consumer
        {
            protected override void Setup()
            {
                Project = "28361e6c-85b8-40f5-bde1-bfc8cf68a96c";
                Token = "PT65bfa7479efd98c38f525e7c352277e70aff63ef22f4e8be";
                Contexts = new List<string> { "test" };
            }

            protected override void OnIncomingMessage(Message message)
            {
                Debug.WriteLine(message.Body.ToString());
                Console.WriteLine(message.Body.ToString());
            }

            protected override void OnIncomingCall(Call call)
            {
                // Answer the incoming call, block until it's answered or an error occurs
                AnswerResult resultAnswer = call.Answer();

                if (!resultAnswer.Successful)
                {
                    // The call was not answered successfully, stop the consumer and bail out
                    Stop();
                    return;
                }

                // Play an audio file, block until it's finished or an error occurs
                call.PlayAudio("https://cdn.signalwire.com/default-music/welcome.mp3");

                // Hangup
                call.Hangup();

                // Stop the consumer
                Stop();
            }
        }
    }
}
