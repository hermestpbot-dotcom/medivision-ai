$token = "rnd_nr9sf2Vzy8Dz1LaNO69Oa2n5dJAr"
$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

# Use blueprint/rener.yaml approach
$body = @{
    name = "medivision-api"
    ownerId = "tea-d8m61rb7uimc73d1vigg"
} | ConvertTo-Json

Write-Host "Trying blueprint create..."
try {
    $response = Invoke-RestMethod -Uri "https://api.render.com/v1/blueprints" -Method POST -Headers $headers -Body $body
    Write-Host "SUCCESS:"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "ERROR: $($_.Exception.Message)"
}

# Also try the services endpoint with just repo + rootDir (auto-detect from render.yaml)
Write-Host "`nTrying repo-based create..."
$body2 = @{
    name = "medivision-api"
    ownerId = "tea-d8m61rb7uimc73d1vigg"
    repo = "https://github.com/hermestpbot-dotcom/medivision-ai"
} | ConvertTo-Json

try {
    $response2 = Invoke-RestMethod -Uri "https://api.render.com/v1/services" -Method POST -Headers $headers -Body $body2
    Write-Host "SUCCESS:"
    $response2 | ConvertTo-Json -Depth 10
} catch {
    Write-Host "ERROR: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Details: $errorBody"
    }
}
