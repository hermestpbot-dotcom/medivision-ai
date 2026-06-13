$token = "rnd_nr9sf2Vzy8Dz1LaNO69Oa2n5dJAr"
$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

# Try with explicit envSpecificDetails for Python
$body = @{
    type = "web_service"
    name = "medivision-api"
    ownerId = "tea-d8m61rb7uimc73d1vigg"
    repo = "https://github.com/hermestpbot-dotcom/medivision-ai"
    branch = "main"
    rootDir = "backend"
    serviceDetails = @{
        env = "python"
        plan = "free"
        region = "oregon"
        branch = "main"
        rootDir = "backend"
        buildCommand = "pip install -r requirements.txt"
        startCommand = "uvicorn app.main:app --host 0.0.0.0 --port `$PORT"
        healthCheckPath = "/api/v1/health"
        envVars = @(
            @{key = "CORS_ORIGINS"; value = "*"},
            @{key = "DEBUG"; value = "false"}
        )
        envSpecificDetails = @{
            pythonVersion = "3.11"
            pipVersion = "24.0"
        }
    }
} | ConvertTo-Json -Depth 10

$jsonBody = [System.Text.Encoding]::UTF8.GetBytes($body)

try {
    $response = Invoke-RestMethod -Uri "https://api.render.com/v1/services" -Method POST -Headers $headers -Body $jsonBody
    Write-Host "SUCCESS:"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "STATUS: $($_.Exception.Response.StatusCode)"
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $errorBody = $reader.ReadToEnd()
    Write-Host "BODY: $errorBody"
}
