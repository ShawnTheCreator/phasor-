using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Phasor.Domain;

namespace Phasor.Api
{
    public class GridHub : Hub
    {
        public async Task BroadcastRiskUpdate(GridRiskSummary summary)
        {
            await Clients.All.SendAsync("ReceiveRiskUpdate", summary);
        }

        public async Task BroadcastAlert(Alert alert)
        {
            await Clients.All.SendAsync("ReceiveAlert", alert);
        }
    }
}
