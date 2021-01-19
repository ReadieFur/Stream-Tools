using Microsoft.AspNetCore.SignalR;
using System;
using System.Diagnostics;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWS_Stream_Chat.ChatServices;

namespace AWS_Stream_Chat.Hubs
{
    public class ChatHub : Hub
    {
        public static Dictionary<string, ServicesModel> clients = new Dictionary<string, ServicesModel>();

        public override Task OnConnectedAsync()
        {
            Logger.log(Logger.Levels.Debug, $"New client connected: {Context.ConnectionId}");
            clients.Add(Context.ConnectionId, new ServicesModel());
            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            Logger.log(Logger.Levels.Debug, $"Client {Context.ConnectionId} disconnected for reason: {exception}");
            clients.Remove(Context.ConnectionId);
            return base.OnDisconnectedAsync(exception);
        }
    }
}
