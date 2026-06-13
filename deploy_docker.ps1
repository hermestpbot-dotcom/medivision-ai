$token = "rnd_nr9sf2Vzy8Dz1LaNO69Oa2n5dJAr"
$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

# Create service using Docker runtime (simpler - no envSpecificDetails needed)
$body = @{
    type = "web_service"
    name = "medivision-api"
    ownerId = "tea-d8m61rb7uimc73d1vigg"
    repo = "https://github.com/hermestpbot-dotcom/medivision-ai"
    branch = "main"
    rootDir = "backend"
    serviceDetails = @{
        env = "docker"
        plan = "free"
        region = "oregon"
        branch = "main"
        rootDir = "backend"
        healthCheckPath = "/api/v1/health"
        envVars = @(
            @{key = "CORS_ORIGINS"; value = "*"},
            @{key = "DEBUG"; value = "false"},
            @{key = "SECRET_KEY"; value = "medivision_secret_key_2026_production"}
        )
    }
} | ConvertTo-Json -Depth 5

Write-Host "Sending:"
Write-Host $body
Write-Host "---"

try {
    $response = Invoke-RestMethod -Uri "https://api.render.com/v1/services" -Method POST -Headers $headers -Body $body
    Write-Host "SUCCESS:"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "ERROR: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Details: $errorBody"
    }
}
