Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\getch\.gemini\antigravity-ide\brain\7d9f30cf-1bfc-4819-9b9f-4c5eab511471\.user_uploaded\media_1791806831724.png"
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)

# Copy original to public
Copy-Item $srcPath "G:\Kasma-Tech-Shop\public\kasma-logo.png" -Force
Copy-Item $srcPath "G:\Kasma-Tech-Shop\public\favicon-full.png" -Force

Write-Output "Copied original logo to public\kasma-logo.png"
$bmp.Dispose()
