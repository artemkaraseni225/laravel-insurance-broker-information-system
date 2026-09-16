<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\DocumentUploadRequest;
use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class DocumentController extends Controller
{
    public function store(
        DocumentUploadRequest $request,
        Application $application
    ): JsonResponse {
        Gate::authorize('uploadDocument', $application);

        $file = $request->file('document');

        $path = $file->store(
            "applications/{$application->id}/documents"
        );

        $document = Document::create([
            'application_id' => $application->id,
            'uploaded_by' => $request->user()->id,
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'type' => $file->getMimeType(),
        ]);

        return response()->json([
            'message' => 'Документ успешно загружен',
            'document' => $document,
        ], 201);
    }

      public function show(Document $document)
    {
        Gate::authorize('view', $document);

        if (! Storage::disk('local')->exists($document->file_path)) {
            abort(404, 'Файл не найден');
        }

        return Storage::disk('local')->response($document->file_path, $document->file_name);
    }
}