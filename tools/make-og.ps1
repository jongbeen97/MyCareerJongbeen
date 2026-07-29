# Builds a 1200x630 Open Graph card for the portfolio.
# Korean strings live in og-text.json (UTF-8) so this script stays ASCII-only,
# which keeps Windows PowerShell 5.1 from mangling them on load.
Add-Type -AssemblyName System.Drawing

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$t = [System.IO.File]::ReadAllText((Join-Path $here 'og-text.json'), [System.Text.Encoding]::UTF8) | ConvertFrom-Json
$outPath = $args[0]

$W = 1200; $H = 630
$bmp = New-Object System.Drawing.Bitmap($W, $H)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'AntiAlias'
$g.TextRenderingHint = 'ClearTypeGridFit'
$g.InterpolationMode = 'HighQualityBicubic'

# --- palette (matches the site's --ink / emerald accent) ---
$ink     = [System.Drawing.ColorTranslator]::FromHtml('#08121C')
$ink2    = [System.Drawing.ColorTranslator]::FromHtml('#0E1B27')
$accent  = [System.Drawing.ColorTranslator]::FromHtml('#0A8C64')
$accentL = [System.Drawing.ColorTranslator]::FromHtml('#45C89A')
$white   = [System.Drawing.Color]::White
$muted   = [System.Drawing.ColorTranslator]::FromHtml('#8FA3B4')

# background: subtle vertical gradient
$rect = New-Object System.Drawing.Rectangle(0, 0, $W, $H)
$bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $ink2, $ink, 90.0)
$g.FillRectangle($bg, $rect)

# emerald glow in the lower-right, echoing the site's hero
$glowPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$glowPath.AddEllipse(760, 250, 700, 700)
$glow = New-Object System.Drawing.Drawing2D.PathGradientBrush($glowPath)
$glow.CenterColor = [System.Drawing.Color]::FromArgb(70, $accent)
$glow.SurroundColors = @([System.Drawing.Color]::FromArgb(0, $accent))
$g.FillPath($glow, $glowPath)

# accent bar across the top
$barRect = New-Object System.Drawing.Rectangle(0, 0, $W, 8)
$bar = New-Object System.Drawing.Drawing2D.LinearGradientBrush($barRect, $accent, $accentL, 0.0)
$g.FillRectangle($bar, $barRect)

# --- fonts ---
$fMono  = New-Object System.Drawing.Font('Consolas', 15, [System.Drawing.FontStyle]::Bold)
$fName  = New-Object System.Drawing.Font('Malgun Gothic', 70, [System.Drawing.FontStyle]::Bold)
$fRole  = New-Object System.Drawing.Font('Malgun Gothic', 34, [System.Drawing.FontStyle]::Bold)
$fRoleB = New-Object System.Drawing.Font('Consolas', 24, [System.Drawing.FontStyle]::Regular)
$fLead  = New-Object System.Drawing.Font('Malgun Gothic', 20, [System.Drawing.FontStyle]::Regular)
$fChip  = New-Object System.Drawing.Font('Malgun Gothic', 16, [System.Drawing.FontStyle]::Bold)
$fFoot  = New-Object System.Drawing.Font('Consolas', 16, [System.Drawing.FontStyle]::Regular)

$bWhite  = New-Object System.Drawing.SolidBrush($white)
$bMuted  = New-Object System.Drawing.SolidBrush($muted)
$bAccent = New-Object System.Drawing.SolidBrush($accentL)

$x = 86
$y = 74

# eyebrow with a small square marker
$g.FillRectangle($bAccent, $x, ($y + 6), 10, 10)
$g.DrawString($t.eyebrow, $fMono, $bAccent, ($x + 22), $y)

$y += 52
$g.DrawString($t.name, $fName, $bWhite, ($x - 8), $y)

$y += 142
$g.DrawString($t.roleA, $fRole, $bWhite, ($x - 3), $y)
$roleW = $g.MeasureString($t.roleA, $fRole).Width
$g.DrawString($t.roleB, $fRoleB, $bMuted, ($x + $roleW + 4), ($y + 14))

$y += 78
$g.DrawString($t.lead, $fLead, $bMuted, ($x - 3), $y)
$y += 34
$g.DrawString($t.lead2, $fLead, $bMuted, ($x - 3), $y)

# project chips
$y += 62
$cx = $x
# NOTE: PowerShell variable names are case-insensitive, so these locals must not
# be called $w/$h -- that would clobber the canvas size in $W/$H.
foreach ($c in $t.chips) {
  $chipW = [int]$g.MeasureString($c, $fChip).Width + 34
  $chipH = 44
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $r = 22
  $path.AddArc($cx, $y, $r, $r, 180, 90)
  $path.AddArc(($cx + $chipW - $r), $y, $r, $r, 270, 90)
  $path.AddArc(($cx + $chipW - $r), ($y + $chipH - $r), $r, $r, 0, 90)
  $path.AddArc($cx, ($y + $chipH - $r), $r, $r, 90, 90)
  $path.CloseFigure()
  $fill = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30, $accentL))
  $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(110, $accentL), 1.4)
  $g.FillPath($fill, $path)
  $g.DrawPath($pen, $path)
  $g.DrawString($c, $fChip, $bAccent, ($cx + 17), ($y + 10))
  $cx += $chipW + 12
}

# footer: hairline rule + handle
$rulePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(46, 255, 255, 255), 1.0)
$g.DrawLine($rulePen, $x, ($H - 92), ($W - $x), ($H - 92))
$g.DrawString($t.foot, $fFoot, $bMuted, ($x - 2), ($H - 74))

$g.Dispose()
$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
"saved: $outPath"
