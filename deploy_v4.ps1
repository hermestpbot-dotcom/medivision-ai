$token = "rnd_nr9sf2Vzy8Dz1LaNO69Oa2n5dJAr"
$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

# Create a blueprint (Render reads render.yaml from repo)
$body = @{
    repo = "https://github.com/hermestpbot-dotcom/medivision-ai"
    branch = "main"
} | ConvertTo-Json

Write-Host "Creating blueprint from repo..."
try {
    $response = Invoke-RestMethod -Uri "https://api.render.com/v1/blueprints" -Method POST -Headers $headers -Body $body
    Write-Host "SUCCESS:"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "BLUEPRINT ERROR: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Host "Details: $($reader.ReadToEnd())"
    }
}

# Also try: create service from blueprint ID
Write-Host "`nTrying services with blueprint..."
$body2 = @{
    type = "web_service"
    name = "medivision-api"
    ownerId = "tea-d8m61rb7uimc73d1vigg"
    repo = "https://github.com/hermestpbot-dotcom/medivision-ai"
    branch = "main"
    rootDir = "."
    serviceDetails = @{
        env = "python"
        plan = "free"
    }
} | ConvertTo-Json

try {
    $response2 = Invoke-RestMethod -Uri "https://api.render.com/v1/services" -Method POST -Headers $headers -Body $body2
    Write-Host "SUCCESS:"
    $response2 | ConvertTo-Json -Depth 10
} catch {
    Write-Host "SERVICE ERROR: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Host "Details: $($reader.ReadToEnd())"
    }
}
