Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\Khell\Desktop\Ashley AI\services\ash-admin"

' Set environment variable
WshShell.Environment("Process")("DATABASE_URL") = "postgresql://neondb_owner:npg_oVNf76Kpqasx@ep-falling-fire-a1ru8mim-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

' Run pnpm dev
WshShell.Run "cmd /k pnpm dev", 1, False
