# ===========================================================================
# Download the demo photographs into public\demo\ - no Node.js required.
#
#     powershell -ExecutionPolicy Bypass -File scripts\fetch-demo-photos.ps1
#
# Mirrors scripts/fetch-demo-photos.mjs (same source list, same Unsplash
# download endpoint) for machines that don't have Node installed. Safe to
# re-run: a file that's already there and not tiny is left alone unless
# you pass -Force.
# ===========================================================================

param([switch]$Force)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
if (-not $root) { $root = (Get-Location).Path }
$out = Join-Path $root "public\demo"
New-Item -ItemType Directory -Force -Path $out | Out-Null

$photos = @(
    @{ id = "ohENjR9w0bk"; file = "wedding-01.jpg"; credit = "Alok Verma" },
    @{ id = "SUwPo4ErQCc"; file = "wedding-02.jpg"; credit = "Love Arya" },
    @{ id = "7O422yG_b80"; file = "wedding-03.jpg"; credit = "Amish Thakkar" },
    @{ id = "d-jyMeP6uNQ"; file = "wedding-04.jpg"; credit = "Sean Williams" },
    @{ id = "BEdxXAiRfRM"; file = "wedding-05.jpg"; credit = "Amish Thakkar" },
    @{ id = "bWQ6-0c_ZcM"; file = "wedding-06.jpg"; credit = "Jayesh Jalodara" },
    @{ id = "lKwp3-FQomY"; file = "wedding-07.jpg"; credit = "Khadija Yousaf" },
    @{ id = "y9HsMX3-mUY"; file = "wedding-08.jpg"; credit = "Bella Pon Fruitsia" },
    @{ id = "SHFOaVaVe2A"; file = "wedding-09.jpg"; credit = "iKshana Productions" },
    @{ id = "d9RsO9BHFVQ"; file = "wedding-10.jpg"; credit = "Arto Suraj" },
    @{ id = "MD_ha01Bk7c"; file = "birthday-01.jpg"; credit = "Lidya Nada" },
    @{ id = "Hli3R6LKibo"; file = "birthday-02.jpg"; credit = "Adi Goldstein" },
    @{ id = "Xaanw0s0pMk"; file = "birthday-03.jpg"; credit = "Jason Leung" },
    @{ id = "gm3M-CsuynI"; file = "birthday-04.jpg"; credit = "Tim Zankert" },
    @{ id = "qSPxjNn7Uy8"; file = "birthday-05.jpg"; credit = "Duncan Kidd" },
    @{ id = "-gDHgEcec6Q"; file = "birthday-06.jpg"; credit = "Robert Anderson" },
    @{ id = "18N4okmWccM"; file = "birthday-07.jpg"; credit = "Morgan Lane" },
    @{ id = "kmLUcvhqhSo"; file = "birthday-08.jpg"; credit = "Nick Fewings" },
    @{ id = "oMWPaPtJjes"; file = "naming-01.jpg"; credit = "Marius Muresan" },
    @{ id = "MBIvLGfgw1w"; file = "naming-02.jpg"; credit = "Ayodele Adeniyi" },
    @{ id = "G2GV_InHTQ8"; file = "naming-03.jpg"; credit = "Manish Jadhav" },
    @{ id = "qU20sihrq-w"; file = "naming-04.jpg"; credit = "Marek Studzinski" },
    @{ id = "HghhjYruIIU"; file = "naming-05.jpg"; credit = "Arun Prakash" },
    @{ id = "27Q6hjK-Ivw"; file = "naming-06.jpg"; credit = "Marek Studzinski" },
    @{ id = "thdH4Mgnh-Y"; file = "naming-07.jpg"; credit = "Samuel Lopez Cruz" },
    @{ id = "ygzKK4hlGy8"; file = "naming-08.jpg"; credit = "Rosario Fernandes" },
    @{ id = "bqUZEAeWuok"; file = "house-01.jpg"; credit = "Jakub Zerdzicki" },
    @{ id = "rgJ1J8SDEAY"; file = "house-02.jpg"; credit = "Tierra Mallorca" },
    @{ id = "PxiAc1aElFQ"; file = "house-03.jpg"; credit = "Filip Szalbot" },
    @{ id = "Ebj87ehFNNU"; file = "house-04.jpg"; credit = "Jakub Zerdzicki" },
    @{ id = "LkoDqb5E3zg"; file = "house-05.jpg"; credit = "Dima Solomin" },
    @{ id = "Nel8STCcWy8"; file = "house-06.jpg"; credit = "Kelly Sikkema" },
    @{ id = "0juktkOTkpU"; file = "house-07.jpg"; credit = "Amol Tyagi" }
)

Write-Host "Fetching $($photos.Count) demo photographs into public\demo\`n"

$ok = 0; $skipped = 0; $failed = @()

foreach ($p in $photos) {
    $dest = Join-Path $out $p.file
    if (-not $Force -and (Test-Path $dest) -and (Get-Item $dest).Length -gt 1024) {
        Write-Host "  . $($p.file) (already there)"
        $skipped++
        continue
    }

    $url = "https://unsplash.com/photos/{0}/download?force=true&w=1600" -f $p.id
    $attempt = 0
    $done = $false
    while (-not $done -and $attempt -lt 2) {
        $attempt++
        try {
            Invoke-WebRequest -Uri $url -OutFile $dest -UserAgent "Mozilla/5.0" -MaximumRedirection 10
            $size = (Get-Item $dest).Length
            if ($size -lt 1024) { throw "suspiciously small ($size bytes)" }
            Write-Host ("  + {0} ({1:N1} MB)" -f $p.file, ($size / 1MB))
            $ok++
            $done = $true
        } catch {
            if ($attempt -ge 2) {
                Write-Host "  x $($p.file) - $($_.Exception.Message)"
                $failed += $p
            }
        }
    }
}

Write-Host "`n$ok downloaded, $skipped already present, $($failed.Count) failed."
if ($failed.Count -gt 0) {
    Write-Host "`nFailed:"
    foreach ($f in $failed) { Write-Host ("  {0}  https://unsplash.com/photos/{1}/download?force=true{2}w=1600" -f $f.file, $f.id, "&") }
    Write-Host "`nRe-run with -Force to retry, or download those by hand into public\demo\."
}
