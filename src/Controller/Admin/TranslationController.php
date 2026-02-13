<?php

declare(strict_types=1);

namespace ItechWorld\SuluTranslatorBundle\Controller\Admin;

use ItechWorld\SuluTranslatorBundle\Service\DeeplTranslationService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * REST API controller for DeepL translation operations in the Sulu admin.
 *
 * Provides endpoints for translating text and retrieving API usage statistics.
 */
#[Route('/admin/api/translator', name: 'itech_world_sulu_translator_')]
class TranslationController extends AbstractController
{
    /**
     * @param DeeplTranslationService $deeplService The DeepL translation service
     * @param array<string, string>   $localeMapping Mapping from Sulu locale to DeepL language code
     */
    public function __construct(
        private DeeplTranslationService $deeplService,
        private array $localeMapping,
    ) {}

    /**
     * Translates the given text to the target language.
     *
     * Accepts JSON body with:
     * - text (string, required): The content to translate
     * - target (string, required): The target Sulu locale
     * - source (string, optional): The source language (auto-detected if omitted)
     *
     * @param Request $request The HTTP request containing translation parameters
     *
     * @return JsonResponse The translated text or error message
     */
    #[Route('/translate', name: 'translate', methods: ['POST'])]
    public function translate(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['text']) || empty($data['target'])) {
            return new JsonResponse(
                ['error' => 'Missing required fields: text, target'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $text = (string) $data['text'];
        $targetLocale = (string) $data['target'];
        $sourceLocale = isset($data['source']) ? (string) $data['source'] : null;
        $isHtml = !empty($data['html']);

        // Map Sulu locale to DeepL language code
        $targetLang = $this->mapLocale($targetLocale);
        $sourceLang = $sourceLocale !== null ? $this->mapLocale($sourceLocale) : null;

        try {
            $translation = $this->deeplService->translateText($text, $sourceLang, $targetLang, $isHtml);

            return new JsonResponse(['translation' => $translation]);
        } catch (\Exception $e) {
            return new JsonResponse(
                ['error' => 'Translation failed: ' . $e->getMessage()],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Returns the current DeepL API usage statistics.
     *
     * @return JsonResponse The character count and limit
     */
    #[Route('/usage', name: 'usage', methods: ['GET'])]
    public function usage(): JsonResponse
    {
        try {
            $usage = $this->deeplService->getUsage();

            return new JsonResponse($usage);
        } catch (\Exception $e) {
            return new JsonResponse(
                ['error' => 'Failed to retrieve usage: ' . $e->getMessage()],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Maps a Sulu locale code to a DeepL language code.
     *
     * Falls back to uppercase locale if no mapping is configured.
     *
     * @param string $locale The Sulu locale code (e.g. "en", "fr", "de")
     *
     * @return string The DeepL language code (e.g. "en-GB", "fr", "de")
     */
    private function mapLocale(string $locale): string
    {
        return $this->localeMapping[$locale] ?? strtoupper($locale);
    }
}
