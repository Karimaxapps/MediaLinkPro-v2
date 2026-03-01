-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Create conversation_participants table
CREATE TABLE IF NOT EXISTS public.conversation_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    -- Ensure either profile_id OR organization_id is set
    CONSTRAINT check_participant_type CHECK (
        (profile_id IS NOT NULL AND organization_id IS NULL) OR 
        (profile_id IS NULL AND organization_id IS NOT NULL)
    ),
    UNIQUE(conversation_id, profile_id, organization_id)
);

-- Enable RLS
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
    sender_organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Triggers for updated_at
CREATE TRIGGER handle_updated_at_conversations
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- RLS Helpers
CREATE OR REPLACE FUNCTION public.is_conversation_participant(conv_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.conversation_participants cp
        WHERE cp.conversation_id = conv_id
        AND (
            cp.profile_id = auth.uid() OR
            (cp.organization_id IS NOT NULL AND public.is_org_member(cp.organization_id))
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Conversations
CREATE POLICY "Participants view own conversations"
    ON public.conversations FOR SELECT
    USING (
        public.is_conversation_participant(id) OR
        -- Allow the creator to select it if it has no participants yet (just created)
        NOT EXISTS (
            SELECT 1 FROM public.conversation_participants
            WHERE conversation_id = id
        )
    );

CREATE POLICY "Participants update own conversations"
    ON public.conversations FOR UPDATE
    USING (public.is_conversation_participant(id));

CREATE POLICY "Auth can insert conversations"
    ON public.conversations FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Conversation Participants
CREATE POLICY "Participants view participants"
    ON public.conversation_participants FOR SELECT
    USING (
        public.is_conversation_participant(conversation_id) OR
        profile_id = auth.uid() OR
        (organization_id IS NOT NULL AND public.is_org_member(organization_id))
    );

CREATE POLICY "Auth can insert participants"
    ON public.conversation_participants FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated' AND
        (
            profile_id = auth.uid() OR
            (organization_id IS NOT NULL AND public.is_org_member(organization_id)) OR
            public.is_conversation_participant(conversation_id)
        )
    );

-- Messages
CREATE POLICY "Participants view messages"
    ON public.messages FOR SELECT
    USING (public.is_conversation_participant(conversation_id));

CREATE POLICY "Participants insert messages"
    ON public.messages FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated' AND
        public.is_conversation_participant(conversation_id) AND
        sender_profile_id = auth.uid() AND
        (sender_organization_id IS NULL OR public.is_org_member(sender_organization_id))
    );

CREATE POLICY "Participants update own messages"
    ON public.messages FOR UPDATE
    USING (sender_profile_id = auth.uid());
