using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;

namespace ProjectManagementSystem.API.Services
{
    public static class IdSequenceHelper
    {
        private static readonly string FilePath = Path.Combine(AppContext.BaseDirectory, "task_sequences.json");
        private static readonly object FileLock = new object();

        public class SequenceData
        {
            public Dictionary<string, int> ProjectSequences { get; set; } = new Dictionary<string, int>();
            public Dictionary<string, int> TaskSequences { get; set; } = new Dictionary<string, int>();
        }

        private static SequenceData LoadData()
        {
            lock (FileLock)
            {
                if (!File.Exists(FilePath))
                {
                    return new SequenceData();
                }

                try
                {
                    var json = File.ReadAllText(FilePath);
                    return JsonSerializer.Deserialize<SequenceData>(json) ?? new SequenceData();
                }
                catch
                {
                    return new SequenceData();
                }
            }
        }

        private static void SaveData(SequenceData data)
        {
            lock (FileLock)
            {
                try
                {
                    var json = JsonSerializer.Serialize(data, new JsonSerializerOptions { WriteIndented = true });
                    File.WriteAllText(FilePath, json);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error saving task sequences: {ex.Message}");
                }
            }
        }

        public static int GetOrCreateTaskSequence(int taskId, int projectId)
        {
            var data = LoadData();
            var taskIdKey = taskId.ToString();
            var projectIdKey = projectId.ToString();

            if (data.TaskSequences.TryGetValue(taskIdKey, out var existingSeq))
            {
                return existingSeq;
            }

            int nextSeq = 1;
            if (data.ProjectSequences.TryGetValue(projectIdKey, out var currentSeq))
            {
                nextSeq = currentSeq + 1;
            }

            data.ProjectSequences[projectIdKey] = nextSeq;
            data.TaskSequences[taskIdKey] = nextSeq;
            SaveData(data);

            return nextSeq;
        }

        public static string GetTaskId(int taskId, int projectId)
        {
            var data = LoadData();
            var taskIdKey = taskId.ToString();

            if (data.TaskSequences.TryGetValue(taskIdKey, out var seq))
            {
                return $"TK{projectId}-{seq}";
            }

            var newSeq = GetOrCreateTaskSequence(taskId, projectId);
            return $"TK{projectId}-{newSeq}";
        }
    }
}
