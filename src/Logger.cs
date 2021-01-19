using System;
using System.IO;
using System.Diagnostics;

namespace AWS_Stream_Chat
{
    public class Logger
    {
        private static Levels logLevel;
        private static StreamWriter logFile;
        private static bool fileCreated;

        public Logger(Levels _logLevel)
        {
            logLevel = _logLevel;
            if (logLevel == Levels.None) { return; }
            if (!Directory.Exists("./Logs/")) { Directory.CreateDirectory("./Logs/"); }
        }

        public static void log(Levels _logLevel, string message)
        {
            if (_logLevel < logLevel) { return; }
            if (!fileCreated) //No point creating the file if no logs will be made however this will now be ckecked every time a log is made
            {
                logFile = new StreamWriter($"./Logs/{DateTime.Now.ToString().Replace("/", "-").Replace(":", "-")}.log");
                fileCreated = true;
            }
            System.Reflection.MethodBase stackTrace = new StackTrace().GetFrame(1).GetMethod();
            string log = $"[{_logLevel} at {DateTime.Now} - {stackTrace.DeclaringType}.{stackTrace.Name}] {message}\n";
            logFile.Write(log);
            logFile.Flush();
            Debug.WriteLine(log);
        }

        public enum Levels
        {
            Trace = 0,
            Debug = 1,
            Information = 2,
            Warning = 3,
            Error = 4,
            Critical = 5,
            None = 6
        }
    }
}
