using System;
using System.Collections.Generic;
using Phasor.Domain;

namespace Phasor.Notifications
{
    public interface INotificationDispatcher
    {
        DispatchLogEntry DispatchSms(string recipientPhone, string alertMessage);
        DispatchLogEntry DispatchEmail(string recipientEmail, string subject, string body);
        List<DispatchLogEntry> GetDispatchLog();
    }

    public class MockNotificationDispatcher : INotificationDispatcher
    {
        private readonly List<DispatchLogEntry> _dispatchLog = new()
        {
            new DispatchLogEntry
            {
                Channel = "SMS",
                Recipient = "+27 82 555 0192 (Eskom NTCC Shift Sup)",
                Message = "[PHASOR ALERT] CRITICAL: Kaapvaal geoelectric field 1,840 mV/km. G5 conditions imminent.",
                DispatchedAt = DateTime.UtcNow.AddMinutes(-25),
                Status = "DELIVERED"
            },
            new DispatchLogEntry
            {
                Channel = "EMAIL",
                Recipient = "eskom-ntcc-shift@eskom.co.za",
                Message = "[PHASOR BULLETIN] WATCH: Hydra 765kV Neutral GIC 26.8 A. Q_loss ~22.5 MVAR projected.",
                DispatchedAt = DateTime.UtcNow.AddMinutes(-20),
                Status = "DELIVERED"
            },
            new DispatchLogEntry
            {
                Channel = "EMAIL",
                Recipient = "sansa-spaceweather@sansa.org.za",
                Message = "[PHASOR BULLETIN] ADVISORY: SANSA Hermanus ground dB/dt reached 94 nT/min.",
                DispatchedAt = DateTime.UtcNow.AddMinutes(-10),
                Status = "DELIVERED"
            }
        };

        public DispatchLogEntry DispatchSms(string recipientPhone, string alertMessage)
        {
            var entry = new DispatchLogEntry
            {
                Channel = "SMS",
                Recipient = recipientPhone,
                Message = alertMessage,
                DispatchedAt = DateTime.UtcNow,
                Status = "DELIVERED"
            };
            lock (_dispatchLog)
            {
                _dispatchLog.Insert(0, entry);
            }
            Console.WriteLine($"[SMS Dispatcher] Sent SMS to {recipientPhone}: {alertMessage}");
            return entry;
        }

        public DispatchLogEntry DispatchEmail(string recipientEmail, string subject, string body)
        {
            var entry = new DispatchLogEntry
            {
                Channel = "EMAIL",
                Recipient = recipientEmail,
                Message = $"{subject}: {body}",
                DispatchedAt = DateTime.UtcNow,
                Status = "DELIVERED"
            };
            lock (_dispatchLog)
            {
                _dispatchLog.Insert(0, entry);
            }
            Console.WriteLine($"[Email Dispatcher] Sent Email to {recipientEmail}: {subject}");
            return entry;
        }

        public List<DispatchLogEntry> GetDispatchLog()
        {
            lock (_dispatchLog)
            {
                return new List<DispatchLogEntry>(_dispatchLog);
            }
        }
    }
}
