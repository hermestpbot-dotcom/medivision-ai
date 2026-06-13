$token = "rnd_nr9sf2Vzy8Dz1LaNO69Oa2n5dJAr"
$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

# Minimal payload - let Render read render.yaml from repo
$body = @{
    type = "web_service"
    name = "medivision-backend"
    ownerId = "tea-d8m61rb7uimc73d1vigg"
    repo = "https://github.com/hermestpbot-dotcom/medivision-ai"
    branch = "main"
    serviceDetails = @{
        env = "python"
        plan = "free"
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
