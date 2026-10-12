Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\getch\.gemini\antigravity-ide\brain\7d9f30cf-1bfc-4819-9b9f-4c5eab511471\.user_uploaded\media_1791806831724.png"
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)

$minX = $bmp.Width; $maxX = 0; $minY = 398; $maxY = 0

for ($y = 162; $y -le 398; $y += 1) {
    for ($x = 140; $x -le 502; $x += 1) {
        $p = $bmp.GetPixel($x, $y)
        if ($p.R -lt 230 -or $p.G -lt 230 -or $p.B -lt 230) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Output "Monogram bounds: minX=$minX, maxX=$maxX, minY=$minY, maxY=$maxY (Width: $($maxX - $minX), Height: $($maxY - $minY))"
$bmp.Dispose()
