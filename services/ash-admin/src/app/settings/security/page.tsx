'use client'

import { useState } from 'react'
import { Shield, Key, Download, Smartphone, AlertCircle, CheckCircle2, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import toast from 'react-hot-toast'

export default function SecuritySettingsPage() {
  const [show2FASetup, setShow2FASetup] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const userId = 'cmg8yu1ke0001c81pbqgcamxu' // TODO: Get from auth context

  const setup2FA = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to setup 2FA')
      }

      setQrCode(data.qr_code)
      setBackupCodes(data.backup_codes)
      setShow2FASetup(true)
      toast.success('2FA setup initiated. Scan the QR code with your authenticator app.')
    } catch (error: any) {
      toast.error(error.message || 'Failed to setup 2FA')
    } finally {
      setLoading(false)
    }
  }

  const verify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit code')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          token: verificationCode,
          enable_2fa: true,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Invalid verification code')
      }

      setTwoFactorEnabled(true)
      setShow2FASetup(false)
      setVerificationCode('')
      toast.success('2FA enabled successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  const disable2FA = async () => {
    if (!confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/auth/2fa/setup?user_id=${userId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to disable 2FA')
      }

      setTwoFactorEnabled(false)
      toast.success('2FA has been disabled')
    } catch (error: any) {
      toast.error(error.message || 'Failed to disable 2FA')
    } finally {
      setLoading(false)
    }
  }

  const downloadBackupCodes = () => {
    const text = backupCodes.join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ashley-ai-backup-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Backup codes downloaded')
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
        <p className="text-gray-500 mt-2">Manage your account security and authentication</p>
      </div>

      {/* 2FA Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Two-Factor Authentication (2FA)
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              {twoFactorEnabled
                ? '2FA is currently enabled for your account. You will need to enter a code from your authenticator app when logging in.'
                : 'Enable 2FA to protect your account with time-based one-time passwords (TOTP) using apps like Google Authenticator or Authy.'}
            </AlertDescription>
          </Alert>

          {twoFactorEnabled ? (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">2FA is Enabled</p>
                  <p className="text-sm text-green-700">Your account is protected</p>
                </div>
              </div>
              <Button variant="outline" onClick={disable2FA} disabled={loading}>
                Disable 2FA
              </Button>
            </div>
          ) : (
            <Button onClick={setup2FA} disabled={loading}>
              <Key className="w-4 h-4 mr-2" />
              {loading ? 'Setting up...' : 'Enable 2FA'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* 2FA Setup Modal */}
      {show2FASetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Setup Two-Factor Authentication
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShow2FASetup(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Scan QR Code */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">Step 1: Scan QR Code</h3>
                  <p className="text-sm text-gray-600">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                  </p>
                </div>
                {qrCode && (
                  <div className="flex justify-center p-4 bg-white border rounded-lg">
                    <img src={qrCode} alt="2FA QR Code" className="w-64 h-64" />
                  </div>
                )}
              </div>

              {/* Step 2: Save Backup Codes */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">Step 2: Save Backup Codes</h3>
                  <p className="text-sm text-gray-600">
                    Save these backup codes in a safe place. You can use them to access your account if you lose your phone.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 border rounded-lg space-y-2">
                  <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="p-2 bg-white border rounded text-center">
                        {code}
                      </div>
                    ))}
                  </div>
                  <Button onClick={downloadBackupCodes} variant="outline" size="sm" className="w-full mt-2">
                    <Download className="w-4 h-4 mr-2" />
                    Download Backup Codes
                  </Button>
                </div>
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    These codes will only be shown once. Make sure to save them before continuing.
                  </AlertDescription>
                </Alert>
              </div>

              {/* Step 3: Verify */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">Step 3: Verify Setup</h3>
                  <p className="text-sm text-gray-600">
                    Enter the 6-digit code from your authenticator app to verify setup
                  </p>
                </div>
                <div>
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    className="text-center text-2xl tracking-widest"
                  />
                </div>
                <Button onClick={verify2FA} disabled={loading || verificationCode.length !== 6} className="w-full">
                  {loading ? 'Verifying...' : 'Verify and Enable 2FA'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
