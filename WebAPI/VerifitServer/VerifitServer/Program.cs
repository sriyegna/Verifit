﻿using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SignalWire.Relay;
using SignalWire.Relay.Messaging;
using static VerifitServer.Services.OnIncomingMessage;

namespace VerifitServer
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateWebHostBuilder(args)
                .UseContentRoot(Directory.GetCurrentDirectory()).UseIISIntegration().Build().Run();

        }


        public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
            .UseStartup<Startup>()
            .UseUrls("http://*:80", "https://*:4440");
    }
}
