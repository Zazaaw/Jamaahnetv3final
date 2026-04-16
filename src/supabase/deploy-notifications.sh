#!/bin/bash

# =====================================================
# Chat Notification Deployment Script
# =====================================================
# This script automates the deployment of chat notifications
# using Supabase Edge Functions and Firebase Cloud Messaging
# =====================================================

set -e  # Exit on error

echo "🚀 Jamaah.net Chat Notification Setup"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check if Supabase CLI is installed
echo "📦 Step 1: Checking Supabase CLI..."
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found!${NC}"
    echo "Install it with: npm install -g supabase"
    exit 1
fi
echo -e "${GREEN}✅ Supabase CLI found${NC}"
echo ""

# Step 2: Check if logged in
echo "🔐 Step 2: Checking Supabase login..."
if ! supabase projects list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Supabase${NC}"
    echo "Logging in..."
    supabase login
fi
echo -e "${GREEN}✅ Logged in to Supabase${NC}"
echo ""

# Step 3: Check if project is linked
echo "🔗 Step 3: Checking project link..."
if [ ! -f "supabase/.temp/project-ref" ]; then
    echo -e "${YELLOW}⚠️  Project not linked${NC}"
    echo "Please enter your Supabase project reference ID:"
    read -p "Project Ref: " PROJECT_REF
    supabase link --project-ref "$PROJECT_REF"
else
    echo -e "${GREEN}✅ Project linked${NC}"
fi
echo ""

# Step 4: Set Firebase Server Key
echo "🔑 Step 4: Setting Firebase Server Key..."
echo "Please enter your Firebase Server Key (from Firebase Console → Cloud Messaging):"
read -p "Firebase Server Key: " FIREBASE_SERVER_KEY

if [ -z "$FIREBASE_SERVER_KEY" ]; then
    echo -e "${RED}❌ Firebase Server Key is required!${NC}"
    exit 1
fi

supabase secrets set FIREBASE_SERVER_KEY="$FIREBASE_SERVER_KEY"
echo -e "${GREEN}✅ Firebase Server Key set${NC}"
echo ""

# Step 5: Deploy Edge Function
echo "🚀 Step 5: Deploying edge function..."
supabase functions deploy send-chat-notification --no-verify-jwt

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Edge function deployed successfully${NC}"
else
    echo -e "${RED}❌ Edge function deployment failed${NC}"
    exit 1
fi
echo ""

# Step 6: Get project details for webhook setup
echo "📋 Step 6: Getting project details..."
PROJECT_REF=$(cat supabase/.temp/project-ref 2>/dev/null || echo "")
if [ -z "$PROJECT_REF" ]; then
    echo -e "${YELLOW}⚠️  Could not auto-detect project ref${NC}"
    echo "Please enter your project reference ID:"
    read -p "Project Ref: " PROJECT_REF
fi

WEBHOOK_URL="https://${PROJECT_REF}.supabase.co/functions/v1/send-chat-notification"

echo ""
echo "======================================"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "======================================"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Create Database Webhook:"
echo "   - Go to: https://supabase.com/dashboard/project/${PROJECT_REF}/database/webhooks"
echo "   - Click 'Create a new hook'"
echo "   - Configure:"
echo "     • Name: chat-notification-webhook"
echo "     • Table: messages"
echo "     • Events: Insert (checked)"
echo "     • Method: POST"
echo "     • URL: ${WEBHOOK_URL}"
echo "   - Add Headers:"
echo "     • Content-Type: application/json"
echo "     • Authorization: Bearer YOUR_ANON_KEY"
echo ""
echo "2. Get your Anon Key:"
echo "   - Go to: https://supabase.com/dashboard/project/${PROJECT_REF}/settings/api"
echo "   - Copy the 'anon public' key"
echo ""
echo "3. Test the notification:"
echo "   - Send a message in your app"
echo "   - Check logs: supabase functions logs send-chat-notification --tail"
echo ""
echo "📚 Documentation:"
echo "   - Setup Guide: supabase/WEBHOOK_SETUP_SIMPLE.md"
echo "   - Testing Guide: supabase/NOTIFICATION_TEST_GUIDE.md"
echo "   - Detailed Setup: supabase/CHAT_NOTIFICATION_SETUP.md"
echo ""
echo -e "${GREEN}Happy coding! 🌙${NC}"
echo ""
