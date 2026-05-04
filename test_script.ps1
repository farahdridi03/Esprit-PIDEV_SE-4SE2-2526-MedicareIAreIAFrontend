$request = [System.Net.WebRequest]::Create("http://localhost:8081/springsecurity/auth/register")
$request.Method = "POST"
$request.ContentType = "application/json"
$bytes = [System.Text.Encoding]::UTF8.GetBytes((Get-Content .\test_payload.json -Raw))
$request.ContentLength = $bytes.Length
$stream = $request.GetRequestStream()
$stream.Write($bytes, 0, $bytes.Length)
$stream.Close()
try {
    $response = $request.GetResponse()
    $reader = [System.IO.StreamReader]::new($response.GetResponseStream())
    Write-Host "SUCCESS: $($reader.ReadToEnd())"
} catch {
    $errStream = $_.Exception.Response.GetResponseStream()
    $reader = [System.IO.StreamReader]::new($errStream)
    Write-Host "ERROR_BODY: $($reader.ReadToEnd())"
}
