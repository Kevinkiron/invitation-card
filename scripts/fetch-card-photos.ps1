# ==========================================================================
# Downloads the 4 placeholder occasion photos (wedding, birthday, naming,
# housewarming) used on the homepage's "Big Moments" cards, and saves them
# into public/images/cards/ so the site can use them.
#
# Run this from inside the invitation-card project folder:
#   powershell -ExecutionPolicy Bypass -File scripts\fetch-card-photos.ps1
#
# The download links below are temporary (they expire after a few hours),
# so run this soon after you receive it. If a link has expired by the time
# you run it, ask Claude to regenerate fresh ones.
# ==========================================================================

$ErrorActionPreference = "Stop"
$outDir = Join-Path $PSScriptRoot "..\public\images\cards"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$photos = @(
  @{ file = "wedding.jpg";      url = "https://media.canva.com/v2/image-resize/format:JPG/height:149/quality:75/uri:ifs%3A%2F%2FM%2F08ab3236-fd49-48ba-b0e8-ff3f4690bef9/watermark:F/width:200?csig=AAAAAAAAAAAAAAAAAAAAAGJD3RiNKG7D_ECvLIwFKOtMUWJY-shJWFp1tqWQtqmE&exp=1790161787&osig=AAAAAAAAAAAAAAAAAAAAAHjAT3OnL6kQUBSBN4yrW9WWqOPlofp76wGG0feu5WTE&signer=media-rpc&x-canva-quality=thumbnail" },
  @{ file = "birthday.jpg";     url = "https://media.canva.com/v2/image-resize/format:JPG/height:149/quality:75/uri:ifs%3A%2F%2FM%2Fdddc21c6-8aff-4d03-83e8-b2407285fa46/watermark:F/width:200?csig=AAAAAAAAAAAAAAAAAAAAAHRPc_4L7LPOzmQbx225076MzLnmUBUwj91Ukt8NVCRh&exp=1790162519&osig=AAAAAAAAAAAAAAAAAAAAAMz-G-6reW7Gj3F7scpbvFBIDsQwFIXKLIBHS_jWVD7Z&signer=media-rpc&x-canva-quality=thumbnail" },
  @{ file = "naming.jpg";       url = "https://media.canva.com/v2/image-resize/format:JPG/height:149/quality:75/uri:ifs%3A%2F%2FM%2F285d6131-2015-402a-98ba-36a27f003002/watermark:F/width:200?csig=AAAAAAAAAAAAAAAAAAAAAGs58qlDUivV03VphftR0BQVIDc-4ofCmugtSFCOa8vY&exp=1790162136&osig=AAAAAAAAAAAAAAAAAAAAAK5MQoAqrjRp5gJHAUiN7RSsfnzQVDL5MDFAew4-ybqd&signer=media-rpc&x-canva-quality=thumbnail" },
  @{ file = "housewarming.jpg"; url = "https://media.canva.com/v2/image-resize/format:JPG/height:149/quality:75/uri:ifs%3A%2F%2FM%2F66bc3c06-7723-45bf-9a95-ea77a04581b7/watermark:F/width:200?csig=AAAAAAAAAAAAAAAAAAAAAO1MagmZ1uPnZ_iw4ac8dDfsGYljqMNUycEWWs74lVS3&exp=1790160117&osig=AAAAAAAAAAAAAAAAAAAAAMeX_WgNoxO-YhXxrYtfVMJiK0EThjxw2i4HdXQAjuOy&signer=media-rpc&x-canva-quality=thumbnail" }
)

$failed = @()
foreach ($p in $photos) {
  $dest = Join-Path $outDir $p.file
  Write-Host ("Downloading {0} ..." -f $p.file)
  try {
    Invoke-WebRequest -Uri $p.url -OutFile $dest -UseBasicParsing
    Write-Host ("  saved -> {0}" -f $dest)
  } catch {
    Write-Host ("  FAILED: {0}" -f $_.Exception.Message)
    $failed += $p.file
  }
}

if ($failed.Count -gt 0) {
  Write-Host ""
  Write-Host "These did not download (likely an expired link) - tell Claude:"
  foreach ($f in $failed) { Write-Host ("  {0}" -f $f) }
} else {
  Write-Host ""
  Write-Host "All 4 photos downloaded into public\images\cards\"
}
