using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using System.Collections.Generic;

namespace AWS_Stream_Chat
{
    public class Program
    {
        public static Dictionary<string, string> _args = new Dictionary<string, string>();

        public static void Main(string[] args)
        {
#if DEBUG
            new Logger(Logger.Levels.Trace);
#else
            new Logger(Logger.Levels.Error);
#endif

            for (int i = 0; i < args.Length; i++)
            {
                if (args[i].StartsWith("--")) { _args.Add(args[i].Substring(2), args[++i]); }
                else { _args.Add(args[i].Substring(1), string.Empty); }
            }

            _args.Add("webRoot", _args.TryGetValue("webRoot", out string wr) ? $"/{wr}" : string.Empty);

            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
    }
}
