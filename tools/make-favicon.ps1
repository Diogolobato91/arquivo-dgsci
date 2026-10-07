Add-Type -AssemblyName System.Drawing

$srcPath = Join-Path $PSScriptRoot "..\logo-dgsci.png"
$destPathPng = Join-Path $PSScriptRoot "..\favicon.png"
$destPathIco = Join-Path $PSScriptRoot "..\favicon.ico"

$src = [System.Drawing.Image]::FromFile($srcPath)

# 64x64 PNG
$dest = New-Object System.Drawing.Bitmap 64, 64
$g = [System.Drawing.Graphics]::FromImage($dest)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.Clear([System.Drawing.Color]::Transparent)
$g.DrawImage($src, 0, 0, 64, 64)
$dest.Save($destPathPng, [System.Drawing.Imaging.ImageFormat]::Png)

# 32x32 for ICO
$dest32 = New-Object System.Drawing.Bitmap 32, 32
$g32 = [System.Drawing.Graphics]::FromImage($dest32)
$g32.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g32.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g32.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g32.Clear([System.Drawing.Color]::Transparent)
$g32.DrawImage($src, 0, 0, 32, 32)

$ms = New-Object System.IO.MemoryStream
$dest32.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
$pngBytes = $ms.ToArray()

# Build ICO with PNG payload
$fs = [System.IO.File]::Create($destPathIco)
$bw = New-Object System.IO.BinaryWriter $fs
$bw.Write([UInt16]0) # Reserved
$bw.Write([UInt16]1) # Type 1 = ICO
$bw.Write([UInt16]1) # 1 image
$bw.Write([Byte]32)  # Width
$bw.Write([Byte]32)  # Height
$bw.Write([Byte]0)   # Colors
$bw.Write([Byte]0)   # Reserved
$bw.Write([UInt16]1) # Planes
$bw.Write([UInt16]32)# BitCount
$bw.Write([UInt32]$pngBytes.Length) # Image size
$bw.Write([UInt32]22) # Offset (6 + 16 = 22)
$bw.Write($pngBytes)
$bw.Flush()
$bw.Close()
$fs.Close()

$g.Dispose()
$dest.Dispose()
$g32.Dispose()
$dest32.Dispose()
$src.Dispose()
$ms.Dispose()

Write-Output "Favicon PNG e ICO gerados com sucesso a partir da logo oficial DGSCI!"
