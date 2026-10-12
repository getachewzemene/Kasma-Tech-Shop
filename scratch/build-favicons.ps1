Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\getch\.gemini\antigravity-ide\brain\7d9f30cf-1bfc-4819-9b9f-4c5eab511471\.user_uploaded\media_1791806831724.png"
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)

$destDir = "G:\Kasma-Tech-Shop\public"
if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Force -Path $destDir
}

# 1. Monogram crop: 280x280 centered on monogram
# Center is (333, 280), crop from (193, 140)
$cropRect = New-Object System.Drawing.Rectangle(193, 140, 280, 280)
$monogramBmp = New-Object System.Drawing.Bitmap(280, 280)
$g = [System.Drawing.Graphics]::FromImage($monogramBmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.DrawImage($bmp, (New-Object System.Drawing.Rectangle(0, 0, 280, 280)), $cropRect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()

# Save 512x512 high-res monogram
$bmp512 = New-Object System.Drawing.Bitmap(512, 512)
$g512 = [System.Drawing.Graphics]::FromImage($bmp512)
$g512.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g512.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g512.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g512.Clear([System.Drawing.Color]::White)
$g512.DrawImage($monogramBmp, (New-Object System.Drawing.Rectangle(0, 0, 512, 512)), (New-Object System.Drawing.Rectangle(0, 0, 280, 280)), [System.Drawing.GraphicsUnit]::Pixel)
$g512.Dispose()
$bmp512.Save("$destDir\favicon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp512.Save("$destDir\icon-512.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp512.Dispose()

# Save Apple Touch Icon (180x180)
$bmp180 = New-Object System.Drawing.Bitmap(180, 180)
$g180 = [System.Drawing.Graphics]::FromImage($bmp180)
$g180.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g180.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g180.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g180.Clear([System.Drawing.Color]::White)
$g180.DrawImage($monogramBmp, (New-Object System.Drawing.Rectangle(0, 0, 180, 180)), (New-Object System.Drawing.Rectangle(0, 0, 280, 280)), [System.Drawing.GraphicsUnit]::Pixel)
$g180.Dispose()
$bmp180.Save("$destDir\apple-touch-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp180.Dispose()

# Save 192x192 (PWA standard)
$bmp192 = New-Object System.Drawing.Bitmap(192, 192)
$g192 = [System.Drawing.Graphics]::FromImage($bmp192)
$g192.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g192.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g192.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g192.Clear([System.Drawing.Color]::White)
$g192.DrawImage($monogramBmp, (New-Object System.Drawing.Rectangle(0, 0, 192, 192)), (New-Object System.Drawing.Rectangle(0, 0, 280, 280)), [System.Drawing.GraphicsUnit]::Pixel)
$g192.Dispose()
$bmp192.Save("$destDir\icon-192.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp192.Dispose()

# Save 32x32
$bmp32 = New-Object System.Drawing.Bitmap(32, 32)
$g32 = [System.Drawing.Graphics]::FromImage($bmp32)
$g32.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g32.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g32.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g32.Clear([System.Drawing.Color]::White)
$g32.DrawImage($monogramBmp, (New-Object System.Drawing.Rectangle(0, 0, 32, 32)), (New-Object System.Drawing.Rectangle(0, 0, 280, 280)), [System.Drawing.GraphicsUnit]::Pixel)
$g32.Dispose()
$bmp32.Save("$destDir\favicon-32x32.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Save 16x16
$bmp16 = New-Object System.Drawing.Bitmap(16, 16)
$g16 = [System.Drawing.Graphics]::FromImage($bmp16)
$g16.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g16.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g16.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g16.Clear([System.Drawing.Color]::White)
$g16.DrawImage($monogramBmp, (New-Object System.Drawing.Rectangle(0, 0, 16, 16)), (New-Object System.Drawing.Rectangle(0, 0, 280, 280)), [System.Drawing.GraphicsUnit]::Pixel)
$g16.Dispose()
$bmp16.Save("$destDir\favicon-16x16.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Save favicon.ico from 32x32
$hIcon = $bmp32.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$fs = New-Object System.IO.FileStream("$destDir\favicon.ico", [System.IO.FileMode]::Create)
$icon.Save($fs)
$fs.Close()
$fs.Dispose()
$icon.Dispose()

$bmp32.Dispose()
$bmp16.Dispose()
$monogramBmp.Dispose()
$bmp.Dispose()

Write-Output "All favicon assets successfully generated in $destDir"
