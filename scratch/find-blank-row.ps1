Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\getch\.gemini\antigravity-ide\brain\7d9f30cf-1bfc-4819-9b9f-4c5eab511471\.user_uploaded\media_1791806831724.png"
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)

# Check horizontal lines for non-white pixels
for ($y = 160; $y -le 480; $y += 5) {
    $nonWhite = 0
    for ($x = 130; $x -le 510; $x += 2) {
        $p = $bmp.GetPixel($x, $y)
        if ($p.R -lt 230 -or $p.G -lt 230 -or $p.B -lt 230) {
            $nonWhite++
        }
    }
    if ($nonWhite -eq 0) {
        Write-Output "Blank row at y=$y"
    }
}

$bmp.Dispose()
