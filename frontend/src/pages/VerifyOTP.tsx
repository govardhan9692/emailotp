import React from "react";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2, CheckCircle2, ArrowLeft, RefreshCw } from "lucide-react";

const VerifyOTP = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes in seconds
  const [resendDisabled, setResendDisabled] = useState(true);
  const [success, setSuccess] = useState(false);
  
  // Get email from location state
  const email = location.state?.email;

  useEffect(() => {
    // Redirect if no email is provided
    if (!email) {
      navigate("/login");
      return;
    }

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setResendDisabled(false);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Enable resend after 1 minute
    const resendTimer = setTimeout(() => {
      setResendDisabled(false);
    }, 60000);

    return () => {
      clearInterval(timer);
      clearTimeout(resendTimer);
    };
  }, [email, navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit verification code",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        toast({
          title: "Success!",
          description: "Email verified successfully"
        });
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        toast({
          title: "Verification failed",
          description: data.message || "Invalid or expired code",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendDisabled(true);
    setCountdown(600); // Reset countdown to 10 minutes
    
    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "OTP resent!",
          description: "A new verification code has been sent to your email"
        });
        
        // Disable resend button for 1 minute
        setTimeout(() => {
          setResendDisabled(false);
        }, 60000);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to resend OTP",
          variant: "destructive"
        });
        setResendDisabled(false);
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to resend verification code",
        variant: "destructive"
      });
      setResendDisabled(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-md border shadow-lg bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute top-2 left-2 w-8 h-8 p-0"
            onClick={() => navigate("/login")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center justify-center mb-2">
            {success ? (
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            ) : (
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="h-6 w-6 text-primary flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 11V8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="16" r="1" fill="currentColor"/>
                  </svg>
                </div>
              </div>
            )}
          </div>
          
          <CardTitle className="text-2xl font-bold text-center">
            {success ? "Verification Complete" : "Verify Your Email"}
          </CardTitle>
          
          <CardDescription className="text-center">
            {success 
              ? "Your email has been successfully verified!"
              : `We've sent a verification code to ${email}. The code will expire in ${formatTime(countdown)}.`
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {!success && (
            <div className="space-y-6">
              <div className="space-y-4">
                <InputOTP 
                  maxLength={6} 
                  value={otp} 
                  onChange={setOtp}
                  containerClassName="justify-center gap-2"
                  disabled={loading}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="h-12 w-12 text-lg" />
                    <InputOTPSlot index={1} className="h-12 w-12 text-lg" />
                    <InputOTPSlot index={2} className="h-12 w-12 text-lg" />
                    <InputOTPSlot index={3} className="h-12 w-12 text-lg" />
                    <InputOTPSlot index={4} className="h-12 w-12 text-lg" />
                    <InputOTPSlot index={5} className="h-12 w-12 text-lg" />
                  </InputOTPGroup>
                </InputOTP>
                
                <Button 
                  type="button" 
                  onClick={handleVerify}
                  className="w-full"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Code"
                  )}
                </Button>
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the code?
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleResendOTP}
                  disabled={resendDisabled}
                >
                  <RefreshCw className={`mr-2 h-3 w-3 ${resendDisabled ? '' : 'animate-spin'}`} />
                  Resend code
                  {resendDisabled && countdown > 0 && countdown <= 60 && ` (${countdown}s)`}
                </Button>
              </div>
            </div>
          )}
          
          {success && (
            <div className="flex justify-center">
              <div className="bg-green-50 text-green-700 p-4 rounded-lg text-center w-full">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="font-medium">Authentication Successful</p>
                <p className="text-sm mt-1">Redirecting to your dashboard...</p>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col text-center text-sm text-muted-foreground">
          <p>
            Having trouble? <a href="#" className="text-primary hover:underline">Contact support</a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyOTP;
