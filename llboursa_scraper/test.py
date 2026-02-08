"""
Script pour tester Azure OpenAI API
Exécutable de manière autonome
Compatible avec openai >= 1.0.0
"""

import sys
import os

try:
    from openai import AzureOpenAI
    import openai
    print(f"✅ OpenAI version: {openai.__version__}")
except ImportError:
    print("❌ Erreur: Le module 'openai' n'est pas installé.")
    print("📦 Installation requise: pip install openai>=1.0.0")
    sys.exit(1)

# Configuration Azure OpenAI
endpoint = "https://iheccarthage-resource.openai.azure.com/"
deployment_name = "gpt-5.2-chat"
api_key = os.getenv("AZURE_OPENAI_API_KEY", "")
if not api_key:
    raise ValueError("AZURE_OPENAI_API_KEY environment variable is required")
api_version = "2024-02-15-preview"  # Version API Azure

def test_azure_openai():
    """Teste la connexion à Azure OpenAI"""
    try:
        print("\n🔄 Connexion à Azure OpenAI...")
        print(f"📍 Endpoint: {endpoint}")
        print(f"🤖 Modèle: {deployment_name}")
        print(f"📅 API Version: {api_version}\n")
        
        # Désactiver les proxies pour éviter les conflits
        os.environ.pop('HTTP_PROXY', None)
        os.environ.pop('HTTPS_PROXY', None)
        os.environ.pop('http_proxy', None)
        os.environ.pop('https_proxy', None)
        
        # Créer le client Azure OpenAI (compatible avec openai >= 1.0.0)
        client = AzureOpenAI(
            azure_endpoint=endpoint,
            api_key=api_key,
            api_version=api_version,
            timeout=30.0,
            max_retries=2
        )
        
        # Envoyer une requête de test
        print("💬 Envoi de la question: 'What is the capital of France?'\n")
        
        # Note: gpt-5.2-chat ne supporte que temperature=1 (valeur par défaut)
        completion = client.chat.completions.create(
            model=deployment_name,
            messages=[
                {
                    "role": "user",
                    "content": "What is the capital of France?",
                }
            ],
            # temperature=1 est la valeur par défaut, pas besoin de la spécifier
        )
        
        # Afficher la réponse
        response = completion.choices[0].message
        print("✅ Réponse reçue:")
        print(f"   Role: {response.role}")
        print(f"   Content: {response.content}\n")
        
        # Afficher les métadonnées
        print("📊 Métadonnées:")
        print(f"   Model: {completion.model}")
        if hasattr(completion, 'usage') and completion.usage:
            print(f"   Tokens utilisés: {completion.usage.total_tokens}")
            print(f"   - Prompt: {completion.usage.prompt_tokens}")
            print(f"   - Completion: {completion.usage.completion_tokens}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de la connexion à Azure OpenAI:")
        print(f"   Type: {type(e).__name__}")
        print(f"   Message: {str(e)}")
        
        # Afficher plus de détails si disponible
        if hasattr(e, 'response'):
            print(f"   Status Code: {e.response.status_code if hasattr(e.response, 'status_code') else 'N/A'}")
        
        print("\n💡 Vérifications à faire:")
        print("   1. L'endpoint est-il correct?")
        print("      Format attendu: https://[resource-name].openai.azure.com/")
        print("   2. La clé API est-elle valide et active?")
        print("   3. Le nom du déploiement correspond-il à votre ressource Azure?")
        print("   4. Avez-vous les permissions nécessaires sur cette ressource?")
        print("   5. La version de l'API est-elle supportée?")
        print("   6. Votre réseau permet-il l'accès à Azure?")
        
        return False

def test_simple():
    """Test simple sans métadonnées"""
    try:
        print("\n🔄 Test simple de connexion...\n")
        
        # Désactiver les proxies
        os.environ.pop('HTTP_PROXY', None)
        os.environ.pop('HTTPS_PROXY', None)
        os.environ.pop('http_proxy', None)
        os.environ.pop('https_proxy', None)
        
        client = AzureOpenAI(
            azure_endpoint=endpoint,
            api_key=api_key,
            api_version=api_version
        )
        
        # Note: gpt-5.2-chat utilise max_completion_tokens au lieu de max_tokens
        response = client.chat.completions.create(
            model=deployment_name,
            messages=[{"role": "user", "content": "Hello!"}],
            max_completion_tokens=50
        )
        
        print(f"✅ Réponse: {response.choices[0].message.content}")
        return True
        
    except Exception as e:
        print(f"❌ Erreur: {type(e).__name__}: {str(e)}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("   TEST AZURE OPENAI API")
    print("=" * 60)
    
    # Essayer le test complet
    success = test_azure_openai()
    
    # Si échec, essayer un test simple
    if not success:
        print("\n" + "=" * 60)
        print("   TENTATIVE DE TEST SIMPLE")
        print("=" * 60)
        success = test_simple()
    
    print("\n" + "=" * 60)
    if success:
        print("✅ Test réussi!")
    else:
        print("❌ Test échoué!")
        print("\n💡 Suggestions:")
        print("   - Vérifiez votre connexion Internet")
        print("   - Vérifiez les credentials Azure")
        print("   - Essayez: pip install --upgrade openai")
    print("=" * 60)