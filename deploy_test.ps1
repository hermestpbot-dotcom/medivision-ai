$token = "rnd_nr9sf2Vzy8Dz1LaNO69Oa2n5dJAr"
$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

# Minimal valid payload per Render API docs
$payloads = @(
    @{type="web_service";name="medivision-api";ownerId="tea-d8m61rb7uimc73d1vigg";repo="https://github.com/hermestpbot-dotcom/medivision-ai";branch="main";rootDir="backend";serviceDetails=@{env="python";plan="free";region="oregon";buildCommand="pip install -r requirements.txt";startCommand="uvicorn app.main:app --host 0.0.0.0 --port `$PORT";healthCheckPath="/api/v1/health";envVars=@{CORS_ORIGINS="*";DEBUG="false"};envSpecificDetails=@{pythonVersion="3.11"}}},
    @{type="web_service";name="medivision-api";ownerId="tea-d8m61rb7uimc73d1vigg";repo="https://github.com/hermestpbot-dotcom/medivision-ai";branch="main";rootDir="backend";serviceDetails=@{env="docker";plan="free";region="oregon"}},
    @{type="web_service";name="medivision-api";ownerId="tea-d8m61rb7uimc73d1vigg"}
)

foreach ($body in $payloads) {
    $json = $body | ConvertTo-Json -Depth 8
    Write-Host "=== Trying payload ==="
    Write-Host $json.Substring(0, [Math]::Min(200, $json.Length))
    try {
        $response = Invoke-RestMethod -Uri "https://api.render.com/v1/services" -Method POST -Headers $headers -Body $json
        Write-Host "SUCCESS: $($response | ConvertTo-Json -Depth 10)"
        break
    } catch {
        $errMsg = $_.Exception.Message
        $details = ""
        if ($_.Exception.Response) {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $details = $reader.ReadToEnd()
        }
        Write-Host "FAILED: $errMsg $details"
        Write-Host "---"
    }
}
