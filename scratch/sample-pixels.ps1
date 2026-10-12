Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\getch\.gemini\antigravity-ide\brain\7d9f30cf-1bfc-4819-9b9f-4c5eab511471\.user_uploaded\media_1791806831724.png"
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)

Write-Output "Pixel (0,0): $($bmp.GetPixel(0,0))"
Write-Output "Pixel (10,10): $($bmp.GetPixel(10,10))"
Write-Output "Pixel (100,100): $($bmp.GetPixel(100,100))"
Write-Output "Pixel (320, 100): $($bmp.GetPixel(320,100))"
Write-Output "Monogram navy pixel (250, 250): $($bmp.GetPixel(250,250))"
Write-Output "Monogram gold pixel (350, 350): $($bmp.GetPixel(350,350))"

$bmp.Dispose()
